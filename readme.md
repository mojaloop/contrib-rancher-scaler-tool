# Rancher Scaler

[Work in Progress] Rancher Tooling for scaling up and down kubernetes clusters to save 💲💲💲

## Prerequisites:

- Rancher API Access, and an access token (see [rancher api](#rancher-api-examples) below)
- An `.env` file, following the format outlined in `example.env` (see [Running Locally](#Running-Locally) for more information)
- `kubectl` access (this doesn't need to run on the same cluster that does the scaling)
- A valid `rancher-scaler.config.js` file (see [The Config File](#The-Config-File))
- `kubectx` and `kubetail`

## Configuring the CronJobs

```bash
set -a; source .env ;set +a
# create the rancher-scaler-secrets secret
kubectl create secret generic rancher-scaler-secrets \
  --from-literal="cattle_secret_key=${CATTLE_SECRET_KEY}"\
  --from-literal="rancher_base_url=${RANCHER_BASE_URL}"\
  --from-literal="slack_webhook_url=${SLACK_WEBHOOK_URL}"

# create the cronjobs
kubectl create -f ./rancher-scaler-cron-up.yaml
kubectl create -f ./rancher-scaler-cron-down.yaml

# monitor jobs
kubectl get cronjob rancher-scaler-cron-up
kubectl get jobs --watch

# # get logs
# pods=$(kubectl get po | grep rancher-scaler-cron-up | awk '{print $1}')
# kubectl logs $pods

# tail logs with `kubetail`
kubetail rancher-scaler
```

## Running Locally:

### `npm` runner

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
npm run scale:down

# Scale up the node pools in ./config/rancher-scaler.config.js
npm run scale:up


#Scale up, then run boostrap
npm run scale:up && npm run bootstrap

```

### `docker-compose` runner:
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

## Create a One Time Job

> A one-time job, which is easier to debug

```bash
# Souce the .env file to your local environment
set -a; source .env ;set +a

# create the rancher-scaler-secrets secret
kubectl create secret generic rancher-scaler-secrets \
  --from-literal="cattle_secret_key=${CATTLE_SECRET_KEY}"\
  --from-literal="rancher_base_url=${RANCHER_BASE_URL}"\
  --from-literal="slack_webhook_url=${SLACK_WEBHOOK_URL}"

# create the one time job
kubectl create -f ./rancher-scaler-job-down.yaml

kubetail rancher-scaler-tmp

# cleanup the job
kubectl delete -f ./rancher-scaler-job-tmp.yaml
```

## Suspending CronJobs

```bash
kubectl get cronjobs
# NAME                       SCHEDULE     SUSPEND   ACTIVE   LAST SCHEDULE   AGE
# rancher-scaler-cron-down   31 * * * *   False     0        20m             37h
# rancher-scaler-cron-up     1 * * * *    False     0        50m             37h

kubectl patch cronjobs rancher-scaler-cron-down -p '{"spec" : {"suspend" : true }}'
kubectl patch cronjobs rancher-scaler-cron-up -p '{"spec" : {"suspend" : true }}'
```

## Publishing a new Version

CircleCI manages this, by publishing a `mojaloop/rancher-scaler:latest` image to docker hub on _every_ push to master.

> Note: we are using the `latest` tag for now, but we may want to change this in the future

## Rancher API Examples

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

## The Config File

In `./config/rancher-scaler.config.js`, we define a config file to control the scaling behaviour, as well as pre/post scaling hooks:

> Note: We use a .js file, as this allows for commenting 

### Example: A basic config file
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

### Example: A config file with pre and post scale hooks
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

## TODO

1. How can we make sure that the job will run only on the master node?
    - toleration/affinity/nodeSelector?
    - otherwise we can _never_ scale down to 0 in each node pool
1. Set up cloudwatch post scale script  
    - need to add another script that setup the AWS cloudwatch agent. ref: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/download-cloudwatch-agent-commandline.html
    - configure the AWS cloudwatch dashboards to show the instances
1. Add `mojaloop/cost_center` tags to existing node templates in Rancher
1. Deploy live on one of our clusters (dev1? Prod?)

## Backlog

1. Make slack notifications more pretty
1. How can we specify the `rancher-scaler.config.js` at runtime?
    - I guess volume mounts would be the way to do this.
1. Unit Tests
1. Better cli interface (right now it's all ENV vars)
1. Properly compile ts in `docker build` (we are currently using `ts-node`)
1. Add tests to ci/cd pipeline
1. Add optional parallel scaling option



### Verifying bootstrap:

```
ssh -i ~/Downloads/worker5/id_rsa ubuntu@35.178.89.50 'echo "Downloading and running bootstrap script"; 
                  wget https://raw.githubusercontent.com/mojaloop/rancher-scaler/master/config/_boostrap_nvme.sh?token=AAM3EDDHLDU5QIEMED6HYD2665NM4 -O /tmp/_bootstrap_nvme.sh; 
                  #TODO: reenable checksum
                  #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_bootstrap_nvme.sh" | sha256sum --check;
                  sudo sh /tmp/_bootstrap_nvme.sh'
```