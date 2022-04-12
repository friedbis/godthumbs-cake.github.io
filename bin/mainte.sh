#!/bin/bash

BASEDIR=$(dirname $0)
TARGETDIR=$BASEDIR/../docs/_posts


find $TARGET_DIR/ -maxdepth 1 -mtime +5 -type f -print 

