#!/bin/bash
source $(dirname $0)/config.sh
XPOS=$((2935 + $XOFFSET))
WIDTH="300"
LINES=2

updates=$(pacman -Qu | wc -l)
packages=$(pacman -Qq  | wc -l)

(echo "^fg($white)Updates"; echo "$updates"; echo " "; echo "^fg($white0) you have $packages packages";sleep 15) | dzen2 -fg $foreground -bg $background -fn $FONT -x $XPOS -y $YPOS -w $WIDTH -l $LINES -e 'onstart=uncollapse,hide;button1=exit;button2=exec:urxvtc;button3=exit'
