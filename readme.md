# Rancher Scaler

[Work in Progress] Rancher Tooling for scaling up and down kubernetes clusters to save 💲💲💲

## Prerequisites:

- Rancher API Access, and an access token (see [rancher api](#rancher-api) below)
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

# create the cronjob
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
kubectl create -f ./rancher-scaler-job-tmp.yaml

kubetail rancher-scaler-tmp

# cleanup the job
kubectl delete -f ./rancher-scaler-job-tmp.yaml
```

## Publishing a new Version

CircleCI manages this, by publishing a `mojaloop/rancher-scaler:latest` image to docker hub on _every_ push to master.

> Note: we are using the `latest` tag for now, but we may want to change this in the future

## Rancher API

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

in `./config/rancher-scaler.config.js`, we have the following:

> Note: We use a .js file, as this allows for commenting 

`rancher-scaler.config.js`
```js
const config = {
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
    // TODO: Add bootstrap actions here
  ]
}

module.exports = config
```

## Testing out shell scripts

```bash
# run a pod
kubectl create -f ./rancher-scaler-job-tmp.yaml

kubectl get po

kubectl logs rancher-scaler-tmp-hhtdt
kubectl exec -it rancher-scaler-tmp-s55ct sh


# download keys from rancher
# nodes > master > ... > download keys

# log into master node? or can we exec into a container?
ssh -i ~/Downloads/master1/key.pem  ubuntu@35.179.97.99


#Download key files
#inputs: access key, secret key, nodes? baseurl
curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" --location --request GET "${BASE_URL}/v3/nodes/c-kbc2d:m-26tkk/nodeconfig" -o /tmp/keys

kubectl delete -f ./rancher-scaler-job-tmp.yaml


```

## TODO

1. How can we make sure that the job will _always_ be scheduled? Maybe we need an affinity so it ends up on the masters?
1. How can we specify the `rancher-scaler.config.js` at runtime?
  I guess volume mounts would be the way to do this.
1. Slack notification to alert when:
    - scale down is about to happen
    - scale up succeeded
    - bootstrap steps failed
1. Unit Tests
1. Better cli interface (right now it's all ENV vars)
1. Add tests to ci/cd pipeline
1. Properly compile ts in `docker build` (we are currently using `ts-node`)
1. Deploy live on one of our clusters (dev1? Prod?)
1. Add tags to 