# Rancher Scaler

Work in progress repo for scheduling our kube clusters to save 💲💲💲

## Prerequisites:

- Rancher API Access, and an access token (see [rancher api](#rancher-api) below)
- An `.env.local` for running with npm, or `.env.docker` for running with docker-compose (see [Running Locally](#Running-Locally) for more information)
- `kubectl` access (this doesn't need to run on the same cluster that does the scaling)
- A valid `rancher-scaler.config.js` file (see [The Config File](#The-Config-File))

## Configuring the CronJobs

```bash
source .env.local
# create the rancher-scaler-secrets secret
kubectl create secret generic rancher-scaler-secrets \
  --from-literal="cattle_secret_key=${CATTLE_SECRET_KEY}"\
  --from-literal="rancher_base_url=${RANCHER_BASE_URL}"

# create the cronjob
kubectl create -f ./rancher-scaler-cron-up.yaml
kubectl create -f ./rancher-scaler-cron-down.yaml

# monitor jobs
kubectl get cronjob rancher-scaler-cron-up
kubectl get jobs --watch

# get logs
pods=$(kubectl get po | grep rancher-scaler-cron-up | awk '{print $1}')
kubectl logs $pods
```

## Running Locally:

### `npm` runner

```bash
touch .env.local
# `.env.local` should take the format:
#
# export RANCHER_BASE_URL=
# export CATTLE_ACCESS_KEY=
# export CATTLE_SECRET_KEY=
#
source .env.local

# Scale down the node pools in ./config/rancher-scaler.config.js
npm run scale:down

# Scale up the node pools in ./config/rancher-scaler.config.js
npm run scale:up

```

### `docker-compose` runner:
> This is useful as it mimics the way that K8s will run the job: inside a docker container


```bash
touch .env.docker
# `.env.docker` should take the format:
#
#RANCHER_BASE_URL=
#CATTLE_ACCESS_KEY=
#CATTLE_SECRET_KEY=
#
docker build -t mojaloop/rancher-scaler:local .

# configure whether or not to scale UP or DOWN, in the `docker-compose.yml` file

# Run the scaler
docker-compose up
```

## Create a One Time Job

> A one-time job, which is easier to debug

```bash
source .env.local
# create the rancher-scaler-secrets secret
kubectl create secret generic rancher-scaler-secrets \
  --from-literal="cattle_secret_key=${CATTLE_SECRET_KEY}"\
  --from-literal="rancher_base_url=${RANCHER_BASE_URL}"

# create the one time job
kubectl create -f ./rancher-scaler-job-down.yaml

# get the status and logs
kubectl get job rancher-scaler-job-down
kubectl get po | grep rancher-scaler-job-down | awk '{print $1}'
pods=$(kubectl get po | grep rancher-scaler-job-down | awk '{print $1}')
kubectl logs $pods


# cleanup the job
kubectl delete -f ./rancher-scaler-job-down.yaml
```

## Publishing a new Version

CircleCI manages this, by publishing a `mojaloop/rancher-scaler:latest` image to docker hub on _every_ push to master.

> Note: we are using the `latest` tag for now, but we may want to change this in the future

## Rancher API

1. create a new access token in Rancher with global scope (it needs to talk to the root rancher cluster)

2. Make sure you can issue the following commands (the `nodePoolId` and `nodeTemplateId` may change for your environment)

```bash
source .env.local

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
  ]
}

module.exports = config
```

## Questions/TODO

1. How can we make sure that the job will _always_ be scheduled? Maybe we need an affinity so it ends up on the masters?
1. How can we specify the `rancher-scaler.config.js` at runtime?