#!/bin/bash

source $(dirname $0)/config.sh


PERC=`pactl list sinks | grep Volume | head -1 |  awk -F"/" '{print $2}' | sed -e 's/^[ \t]*//'`
ASTAT=`amixer get Master | awk 'END{gsub(/\[|\]|%/,""); print $6}'`
ICON=""

if [[ $ASTAT = "on" ]]; then
    ICON="audioHigh.xbm" #"spkr_01.xbm"
else
    ICON="audio-volume-muted.xbm"
fi

ICON='^i(/home/tom/.xmonad/dzen2/'"$ICON)"
echo "$ICON$PERC"
