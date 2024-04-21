#!/bin/sh
CONF=config-it
export CONF
node ../application/start &>/dev/null &
