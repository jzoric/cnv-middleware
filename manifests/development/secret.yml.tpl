apiVersion: v1
kind: Secret
metadata:
  name: cnv-middleware-secret
type: Opaque
data:
  ARANGO_HOST: $ARANGO_HOST
  ARANGO_USER: $ARANGO_USER
  ARANGO_PASSWORD: $ARANGO_PASSWORD
  ARANGO_DATABASE: $ARANGO_DATABASE
  ADMIN_USER: $ADMIN_USER
  ADMIN_PASSWORD: $ADMIN_PASSWORD