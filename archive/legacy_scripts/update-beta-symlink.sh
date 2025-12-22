#!/bin/bash
# Helper script to update beta symlink
ln -sfn /srv/wdp/beta/releases/$1 /srv/wdp/beta/current
