#!/bin/bash
source $(dirname $0)/config.sh

ICON="Pacman.xbm"
UPDATES=$(pacman -Qu | wc -l)
ICON='^i(/home/tom/.xmonad/dzen2/'"$ICON)"
echo "$ICON $UPDATES"
