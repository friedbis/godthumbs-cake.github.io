#!/bin/bash
#
# auto posting bot
#
#
xmlgetnext () {
   local IFS='>'
   read -d '<' TAG VALUE
}

#countoffsetfile=/tmp/postcount.txt
#
#if [ ! -f $countoffsetfile ];
#then
#    echo 0 >$countoffsetfile
#fi

basedir=$(dirname $0)/..
rssurl="http://headline.5ch.net/bbynews/news.rss||http://vipsister23.com/index.rdf||https://news.yahoo.co.jp/rss/topics/top-picks.xml||http://2ch-c.net/feed/?t=show"
templatefile=$(dirname $0)/post-template.txt
postdate=$(date +%Y-%m-%d-%H-%M)
#postcount=$(head -1 $countoffsetfile)
destdir=$(dirname $0)/../docs/_posts

cd $basedir/
echo -n "check current version..."
git pull
echo "OK"
#echo -n "cleaning post files..."
#rm -f $destdir/*.md
#git rm $destdir/*.md
#echo "deleted"
mkdir -p $destdir
git add *
git commit -m 'cleaning'
git push -u origin main

echo -n 'getting page...'
echo 'parsing...'
for i in $(echo -n "${rssurl}" |sed -e 's/||/\n/g');
do
    echo "${i}..."
    curl -s "${i}" |nkf -w | while xmlgetnext;
    do
        case $TAG in
        'item')
            title=''
            link=''
            pubDate=''
            description=''
            newpostfile=''
            newstitle=''
            ;;
        'title')
            title="$VALUE"
            ;;
        'link')
            link="$VALUE"
            ;;
        'pubDate')
            pubDate="$VALUE"
            ;;
        'description')
            description="$VALUE"
            ;;
        '/item')
            #postcount=$(expr $postcount + 1)
            echo "setting title"
            newstitle=$(echo -n "${title}" |sed -e 's/[【][^】]*[】]//g; s/\[[^]]*\]//g' 2>/dev/null)
            #echo "${newstitle}"
            echo "setting postid"
            postid=$(echo -n "${title}" |md5sum |awk '{print $1;}')
            echo "setting post file"
            newpostfile=${destdir}/${postdate}-${postid}.md
            #echo $newpostfile
            #echo "setting count file"
            #echo $postcount >$countoffsetfile
            echo "checking dupricated..."
            ret=$(ls -l $destdir |grep $postid >/dev/null 2>/dev/null && echo -n "OK" || echo -n "NG")
            if [ "x${ret}" == "xOK" ];
            then
                echo "found same post"
            else
                echo "copying file"
                cp $templatefile $newpostfile
                echo "setting header"
                ret1=$(sed -i -e "s/===title===/${newstitle:0:20}.../g;" $newpostfile && echo -n "OK" || echo -n "NG")
                ret2=$(sed -i -e "s/===subtitle===/${pubDate}/g;" $newpostfile && echo -n "OK" || echo -n "NG")
                ret3=$(sed -i -e "s/===realtitle===/${newstitle}/g" $newpostfile && echo -n "OK" || echo -n "NG")
                ret4=$(sed -i -e "s/===post-excerpt===//g" $newpostfile && echo -n "OK" || echo -n "NG")
                if [ "x${ret1}" == "xNG" -o "x${ret2}" == "xNG" -o "x${ret3}" == "xNG" -o "x${ret4}" == "xNG" ];
                then
                    echo "found error"
                    rm $newpostfile
                else
                    description=$(echo $description |sed -e 's/\(http[^$]*\.[jpg][pni][gf]\)/![](\1)/g; s/\([^(]\)\(http[^ ]*\)\([ \r\n$]\)/\1[\2](\2)\3/g')
                    echo "setting body"
                    cat<<EOF>>$newpostfile
[${link}](${link})
posted on ${pubDate}

<!--more-->

${description}
EOF
                    echo "ready to post an article of ${newstitle}"
                fi
            fi
            ;;
        esac
    done
done

cd $basedir
git add *
git commit -m "newschecker updated"
git push -u origin main 
exit 0
