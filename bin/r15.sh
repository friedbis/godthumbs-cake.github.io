#!/bin/bash

curl -s https://www.necoweb.com/neco/timetable/ 2>&1 |tr -d '\r\n' |sed -e 's/^.*<tbody>\(.*\)\- \/main.*$/\1/; s/<td class="s"[^>]*>[\t 0-9]*<\/td>//g; s/<td class="sl"[^>]*>[^>]*<\/td>//g; s/\(>\)[\t ]*\(<\)/\1\2/g; s/<a href="\([^>]*\)">\([^>]*\)<\/a>/\2,https:\/\/www.necoweb.com\1\&/g; s/<[^>]*>//g; s/[\t ]\{2,20\}/\n/g;' |tr -d "\r\n" |sed -e 's/\([12][0-9]:[0-9]\{1,2\}\)/\n\1-/g; s/\([0-9]:[0-9]\{2\}\)\([^\-]\)/\n\1-\2/g; s/<!-$/\n/; s/\([0-9]\)\-/\1,/g;' |while read i;
do
    echo -n $i |awk 'BEGIN{FS=","} {print $3,$2}'
done

