#!/bin/bash

BASEDIR=$(dirname $0)
. $BASEDIR/../.profile

sudo ${MECABDICTINDEX} -d $USERDICTDIR/ -u $USERDICT -f utf8 -t utf8 $USERDICTCSV

