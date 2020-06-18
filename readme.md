# Rancher Scaler

Work in progress repo for scheduling our kube clusters to save 💲💲💲

## Prerequisites:

- Rancher API Access, and an access token (see [rancher api](#rancher-api) below)
- An `.env.local` for running with npm, or `.env.docker` for running with docker-compose (see [Running Locally](#Running-Locally) for more information)
- `kubectl` access (this doesn't need to run on the same cluster that does the scaling)
- Set up the access token in Kubernetes somehow [todo]
- A valid `rancher-scaler.config.js` file (see [The Config File](#The-Config-File))

## Configuring a CronJob

```bash
# create an example cronjob
kubectl create -f ./rancher-scaler-up-cron.yaml

# monitor jobs
kubectl get cronjob rancher-scaler-up-cron
kubectl get jobs --watch

# get logs
pods=$(kubectl get po | grep rancher-scaler-job-up | awk '{print $1}')
kubectl logs $pods
```

## Running Locally:

### `npm` runner

```bash
touch .env.local
# `.env.local` should take the format:
#
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
kubectl create -f ./rancher-scaler-job-up.yaml
kubectl get job rrancher-scaler-job-up

pods=$(kubectl get po | grep rancher-scaler-job-up | awk '{print $1}')
kubectl logs $pods
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
'https://k8s-tanuki-rancher.mojaloop.live/v3/nodePools/c-vsm2w:np-mg5wr' 

# change the number of nodes
curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" \
-X PUT \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
'https://k8s-tanuki-rancher.mojaloop.live/v3/nodePools/c-vsm2w:np-mg5wr' \
-d '{"quantity": 2, "nodeTemplateId": "cattle-global-nt:nt-user-s7l26-nt-2s4x5"}'
```

## The Config File

in `./config/rancher-scaler.config.js`, we have the following:

> Note: We use a .js file, as this allows for commenting 

`rancher-scaler.config.js`
```js
const config = {
  // The base for the Rancher Managmenet Cluster
  rancherBaseUrl: 'https://k8s-tanuki-rancher.mojaloop.live/v3',
  //A list of node pools that should be scaled up and down
  nodes: [
    {
      // The ID of the node pool - you can find this in the 
      nodePoolId: 'c-vsm2w:np-mg5wr',
      // The nodeTemplateId of the node pool, also found in the api
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
      // When SCALE=DOWN, how many instances should be running?
      minQuantity: 0,
      // When SCALE=UP, how many instances should be running?
      maxQuantity: 2,
    }
  ]
}

module.exports = config
```

## Questions:

1. How do we pass in the secrets dynamically to our cron job in Kubernetes?