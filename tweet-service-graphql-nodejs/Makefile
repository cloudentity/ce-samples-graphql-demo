build-image:
	docker build . -t tweet-service-graphql-nodejs

# Pushed image to cloudentity docker repo to be pulled by other devs
push-image:
	docker image tag tweet-service-graphql-nodejs:latest docker.cloudentity.io/tweet-service-graphql-nodejs:latest
	docker image push docker.cloudentity.io/tweet-service-graphql-nodejs:latest

# Managing local k8s cluster 
deploy-cluster:
	kind create cluster --name local-dev --config k8s-cluster-config.yaml

upload-image:
	kind load --name local-dev docker-image tweet-service-graphql-nodejs:latest

delete-cluster:
	kind delete cluster --name local-dev

deploy-app-graph-ns:
	kubectl create namespace svc-apps-graph-ns
	kubectl label namespace svc-apps-graph-ns istio-injection=enabled --overwrite
	kind load --name local-dev docker-image tweet-service-graphql-nodejs:latest
	helm install svc-apps-graphql helm-chart/tweet-service-graphql-nodejs -n svc-apps-graph-ns

# deploy istio gateway and virtual service	
#	kubectl apply -f istio-ingress-gateway.yaml -n svc-apps-graph-ns
#	kubectl apply -f istio-virtual-svc-routing.yaml -n svc-apps-graph-ns	

# Deploy Istio components to istio namespace
# for more details, https://istio.io/latest/docs/setup/install/helm/
deploy-istio:
	helm repo add istio https://istio-release.storage.googleapis.com/charts
	helm repo update
	kubectl create namespace istio-system
	helm install istio-base istio/base -n istio-system --set global.jwtPolicy=first-party-jwt
	helm install istiod istio/istiod -n istio-system --wait --set global.jwtPolicy=first-party-jwt

	
# Deploy istio ingress on the svc apps namespace - NO_RULE error during enforcement with CE
#deploy-istio-gateway:
#	helm install istio-ingressgateway istio/gateway -n svc-apps-graph-ns -f istio-configs/istio-helm-config-override.yaml
#	kubectl apply -f istio-configs/istio-ingress-gateway-graphql.yaml -n svc-apps-graph-ns
#	kubectl apply -f istio-configs/istio-ingress-virtual-service.yaml -n svc-apps-graph-ns

deploy-istio-gateway:
	helm install istio-ingressgateway istio/gateway -n istio-system -f istio-configs/istio-helm-config-override.yaml
	kubectl apply -f istio-configs/istio-ingress-gateway-graphql.yaml -n istio-system
	kubectl apply -f istio-configs/istio-ingress-virtual-service.yaml -n istio-system	