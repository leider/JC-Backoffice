#!/bin/sh

TOKEN=123456
curl -H "Authorization: Bearer ${TOKEN}" http://localhost:1969/batches/nightly-mails
