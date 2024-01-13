#!/bin/sh
./startTestserver.sh
yarn test
RETURN=$?
./stopTestserver.sh
exit $RETURN
