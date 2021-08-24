#!/bin/bash

R15MOVIEURL=https://www.necoweb.com/neco/timetable/
R15HOST=$(echo -n ${R15MOVIEURL} |sed -e 's/^https:\/\/\([^\/]*\)\/.*$/\1/')
BASEDIR=$(dirname $0)/../
SRCFILE=${BASEDIR}/bin/post-template2.txt
DSTDIR=$BASEDIR/docs/_posts
#DSTDIR=/tmp
nowdate=$(date +%Y-%m-%d)

curl -s $R15MOVIEURL 2>&1 |\
    tr -d '\r\n' |\
    sed -e 's/^.*<tbody>\(.*\)\- \/main.*$/\1/; s/<td class="s"[^>]*>[\t 0-9]*<\/td>//g; s/<td class="sl"[^>]*>[^>]*<\/td>//g; s/\(>\)[\t ]*\(<\)/\1\2/g; s/<a href="\([^>]*\)">\([^>]*\)<\/a>/\2,https:\/\/www.necoweb.com\1\&/g; s/<[^>]*>//g; s/[\t ]\{2,20\}/\n/g;' |\
    tr -d "\r\n" |\
    sed -e 's/\([12][0-9]:[0-9]\{1,2\}\)/\n\1-/g; s/\([0-9]:[0-9]\{2\}\)\([^\-]\)/\n\1-\2/g; s/<!-$/\n/; s/\([0-9]\)\-/\1,/g; ' |\
    grep -v "^$" |\
    while read i;
do
    #echo "[${i}]"
    posttitle=$(echo -n $i |awk 'BEGIN{FS=","} {print $2}')
    posturl=$(echo -n $i |awk 'BEGIN{FS=","} {print $3}' |sed -e 's/\//\\\//g; s/\&/\\\&/g')
    #echo "[${posttitle}]"
    echo "[${posturl}]"
    filename=$DSTDIR/${nowdate}-$(echo -n ${posttitle} |md5sum |awk '{print $1;}').md
    cp -v $SRCFILE $filename
    sed -i -e "s/===realtitle===/${posttitle}/g" $filename
    sed -i -e "s/===body===/[${posttitle}](${posturl})/g" $filename
done

