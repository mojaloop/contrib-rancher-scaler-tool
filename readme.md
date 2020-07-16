# Rancher Scaler
[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/rancher-scaler.svg?style=flat)](https://github.com/mojaloop/rancher-scaler/commits/master)
[![Docker pulls](https://img.shields.io/docker/pulls/mojaloop/rancher-scaler.svg?style=flat)](https://hub.docker.com/r/mojaloop/rancher-scaler)
[![CircleCI](https://circleci.com/gh/mojaloop/rancher-scaler.svg?style=svg)](https://app.circleci.com/pipelines/github/mojaloop/rancher-scaler)

Rancher Tooling for automatically scaling up and down Rancher node pools to save 💵💵💵.

## Contents:
<!-- vscode-markdown-toc -->
* 1. [Prerequisites:](#Prerequisites)
	* 1.1. [Environment Variables](#EnvironmentVariables)
* 2. [Running Rancher-Scaler:](#RunningRancher-Scaler)
	* 2.1. [Kubernetes 1-Off Runs](#Kubernetes1-OffRuns)
	* 2.2. [Local `npm` runner](#Localnpmrunner)
* 3. [Installing Cron-Based Scaling with Helm](#InstallingCron-BasedScalingwithHelm)
* 4. [Publishing a new Version](#PublishinganewVersion)
* 5. [The Config File](#TheConfigFile)
* 6. [Handy Snippets](#HandySnippets)
* 7. [Backlog](#Backlog)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->


##  1. <a name='Prerequisites'></a>Prerequisites:

- Rancher API Access, and an access token (see [rancher api](#rancher-api-examples) below)
- An `.env` file, following the format outlined in `example.env` (see [The .env File](#The.envFile) for more information)
- `kubectl` access (this doesn't need to run on the same cluster that does the scaling), but it _does_ need to have internet access to talk to the Rancher and Slack APIs
- `kubectx` and `kubetail`
- A valid `rancher-scaler.config.js` file (see [The Config File](#The-Config-File))

###  1.1. <a name='EnvironmentVariables'></a>Environment Variables

Rancher-Scaler requires the following environment variables to be set.

| Name | Description | Default | Required | Format |
|---|---|---|---|---|
| `CATTLE_ACCESS_KEY` | The Rancher API Access Key. Go to _your_rancher_base_url_/apikeys to create.      | N/A | **Yes** | string        |
| `CATTLE_SECRET_KEY` | The Rancher API Secret Key. Go to _your_rancher_base_url_/apikeys to create.      | N/A | **Yes** | string        | 
| `RANCHER_BASE_URL`  | The base URL of the master rancher cluster                                        | N/A | **Yes** | `https://...` |
| `SLACK_WEBHOOK_URL` | A Slack Webhook url. Required if using `SLACK_NOTIFICATION` pre/post scale hooks. | N/A    | No | `https://...` |
| `LOG_LEVEL`         | The log level for the logging framework. Defaults to `info`                       | `info` | No | `error`, `info`, `debug` |
| `PATH_TO_CONFIG`    | Path to the rancher-scaler config file. | `./config/rancher-scaler.config.json`            | No | `error`, `info`, `debug` |
| `ENV_FILE`          | Path to the Env file. Used only by `npm run kube-*` commands. | `./config/rancher-scaler.config.json`            | No | `error`, `info`, `debug` |

####  1.1.1. <a name='The.envFile'></a>The .env File

We use a .env file for keeping secrets. You can set up your own `.env` file by copying from the template like so:

```bash
# copy the env var template
cp example.env .env

# Edit the template and fill out the values
vim .env
```

##  2. <a name='RunningRancher-Scaler'></a>Running Rancher-Scaler:

###  2.1. <a name='KubernetesOne-OffRuns'></a>Kubernetes One-Off Runs

This runner executes a 1 off job to perform a scale up or scale down.

For each run, it deletes the old helm deployment, and `helm install`s a new job from `./helm-once`.

```bash
# copy the env var template
cp example.env .env

# Edit the template and fill out the values
vim .env

# set the correct kube context
kubectx public-rancher
kubens rancher-scaler

# set the cluster to be scaled with the config file
export PATH_TO_CONFIG=./config/k8s-tanuki-perf1.config

# Scale down:
npm run kube-scale:down

# Scale up:
npm run kube-scale:up
```

###  2.2. <a name='Localnpmrunner'></a>Local `npm` runner

```bash
# copy the env var template
cp example.env .env

# Edit the template and fill out the values
vim .env

# Souce the .env file to your local environment
set -a; source .env ;set +a

# Verify your rancher env vars are correct
npm run verify

# Scale down the node pools in ./config/rancher-scaler.config.js
npm run local-scale:down

# Scale up the node pools in ./config/rancher-scaler.config.js
npm run local-scale:up
```

##  3. <a name='InstallingCron-BasedScalingwithHelm'></a>Installing Cron-Based Scaling with Helm

```bash
# create the secrets from our `.env` file
kubectl create secret generic rancher-scaler-secrets --from-env-file=.env

# 
# install the charts
helm install rancher-scaler ./helm-cron
```

Take a look at the [`values.yaml`](./helm-cron/values.yaml) for configuration options.

###  3.1. <a name='docker-composerunner:'></a>`docker-compose` runner:
> This is useful as it mimics the way that K8s will run the job: inside a docker container

```bash
cp example.env .env

# Edit the template and fill out the values
vim .env

docker build -t mojaloop/rancher-scaler:local .

# configure whether or not to scale UP or DOWN, in the `docker-compose.yml` file

# Run the scaler
docker-compose up
```

##  4. <a name='PublishinganewVersion'></a>Publishing a new Version

CircleCI manages this, by publishing a `mojaloop/rancher-scaler:latest` image to docker hub on _every_ push to master.

> Note: we are using the `latest` tag for now, but we may want to change this in the future

##  5. <a name='TheConfigFile'></a>The Config File

In `./config/rancher-scaler.config.js`, we define a config file to control the scaling behaviour, as well as pre/post scaling hooks:

> Note: We use a .js file, as this allows for commenting 

###  5.1. <a name='Example:Abasicconfigfile'></a>Example: A basic config file
`rancher-scaler.config.js`
```js
const config = {
  // global hooks: at least {} is required
  globals: {}
  //A list of node pools that should be scaled up and down
  nodes: [
    {
      // The ID of the node pool - you can find this in the 
      nodePoolId: 'c-vsm2w:np-mg5wr',
      // The nodeTemplateId of the node pool, also found in the api
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
      // When SCALE=DOWN, how many instances should be running?
      minQuantity: 1,
      // When SCALE=UP, how many instances should be running?
      maxQuantity: 2,
    }
  ]
}

module.exports = config
```

###  5.2. <a name='Example:Aconfigfilewithglobalpreandpostscalehooks'></a>Example: A config file with global pre and post scale hooks
`rancher-scaler.config.js`
```js
const config = {
  // global hook config, to be run before/after all scale events
  global: {
    preScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaling up `1` node pools', color: 'warn' }
    ],
    postScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled up succesfully! 🎉🎉🎉', color: 'good' }
    ],
    preScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaling down `1` node pool in `1 minute`\n\nRun `kubectl patch cronjobs rancher-scaler-cron-down -p \'{ "spec": { "suspend": true } }\'` to stop this.', color: 'warn'},
      // Sleep to allow user intervention - Note: kubernetes will timeout the job after 10 minutes
      { hookType: 'SLEEP', timeMs: 1000 * 60 * 1 }
    ],
    postScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled down succesfully! 🎉🎉🎉', color: 'good' }
    ],
    onFailure: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale', color: 'danger' }
    ]
  },
  //A list of node pools that should be scaled up and down
  nodes: [
    {
      // The ID of the node pool - you can find this in the 
      nodePoolId: 'c-vsm2w:np-mg5wr',
      // The nodeTemplateId of the node pool, also found in the api
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
      // When SCALE=DOWN, how many instances should be running?
      minQuantity: 1,
      // When SCALE=UP, how many instances should be running?
      maxQuantity: 2,
    }
  ]
}

module.exports = config
```

###  5.3. <a name='SlackNotificationTemplates'></a>Slack Notification Templates

In building out the slack notifications, we provide some very simple template strings to allow you write nice slack notifications:

| name | value | context |
| --- | --- | --- |
| `{{totalNodePools}}` | The total number of node pools being scaled | Global |
| `{{minQuantity}}` | The node count being scaled **down** to | node pool |
| `{{maxQuantity}}` | The node count being scaled **up** to | node pool |
| `{{nodePoolId}}`  | The id of the node pool | node pool |



##  6. <a name='HandySnippets'></a>Handy Snippets

###  6.1. <a name='DebuggingHelmCharts'></a>Debugging Helm Charts 

```bash
helm install --debug --dry-run goodly-guppy ./helm-cron
```

###  6.2. <a name='InstallingwithoutHelm'></a>Installing without Helm

```bash
# create the secrets from our `.env` file
kubectl create secret generic rancher-scaler-secrets --from-env-file=.env

# create the cronjobs
kubectl create -f ./kube/rancher-scaler-cron-up.yaml
kubectl create -f ./kube/rancher-scaler-cron-down.yaml

# monitor jobs
kubectl get cronjob rancher-scaler-cron-up
kubectl get jobs --watch
```

###  6.3. <a name='CreateaOneTimeJob'></a>Create a One Time Job

> A one-time job, which is easier to debug than waiting around for a cronjob to run

```bash
# create the secrets from our `.env` file
kubectl create secret generic rancher-scaler-secrets --from-env-file=.env

# create the one time job
kubectl create -f ./kube/rancher-scaler-job-tmp.yaml

kubetail rancher-scaler-tmp

# cleanup the job
kubectl delete -f ./kube/rancher-scaler-job-tmp.yaml
```

###  6.4. <a name='SuspendingCronJobs'></a>Suspending CronJobs

```bash
kubectl get cronjobs
# NAME                       SCHEDULE     SUSPEND   ACTIVE   LAST SCHEDULE   AGE
# rancher-scaler-cron-down   31 * * * *   False     0        20m             37h
# rancher-scaler-cron-up     1 * * * *    False     0        50m             37h

kubectl patch cronjobs rancher-scaler-cron-down -p '{"spec" : {"suspend" : true }}'
kubectl patch cronjobs rancher-scaler-cron-up -p '{"spec" : {"suspend" : true }}'
```

###  6.5. <a name='RancherAPIExamples'></a>Rancher API Examples

1. create a new access token in Rancher with global scope (it needs to talk to the root rancher cluster)

2. Make sure you can issue the following commands (the `nodePoolId` and `nodeTemplateId` may change for your environment)

```bash
set -a; source .env ;set +a

# get the nodePool
curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" \
-X GET \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
"${RANCHER_BASE_URL}/nodePools/c-vsm2w:np-mg5wr" 

# change the number of nodes
curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" \
-X PUT \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
"${RANCHER_BASE_URL}/nodePools/c-vsm2w:np-mg5wr" \
-d '{"quantity": 2, "nodeTemplateId": "cattle-global-nt:nt-user-s7l26-nt-2s4x5"}'
```


##  7. <a name='Backlog'></a>Backlog
1. Unit Tests
1. Better cli interface (right now it's all ENV vars)
1. Properly compile ts in `docker build` (we are currently using `ts-node`)
1. Add tests to ci/cd pipeline
1. Add optional parallel scaling option
