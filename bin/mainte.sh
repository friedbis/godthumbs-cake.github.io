#!/bin/bash

BASEDIR=$(dirname $0)
TARGETDIR=$BASEDIR/../docs/_posts

echo "checking directory[${TARGETDIR}/]..."
find $TARGETDIR/ -maxdepth 1 -size +10M -type f -name 1999-01-08-archive.md -print 

