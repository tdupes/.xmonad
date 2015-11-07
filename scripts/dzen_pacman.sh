#!/bin/bash
source $(dirname $0)/config.sh
XPOS=$((2200 + $XOFFSET))
WIDTH="500"
pacmanlines=$(pacman -Qu | wc -l)
LINES=$(( $pacmanlines + 3 ))

updates=$(pacman -Qu)

(echo "^fg($white)Updates"; echo "$updates"; echo " "; echo "^fg($white)Right click to update";sleep 15) | dzen2 -fg $foreground -bg $background -fn $FONT -x $XPOS -y $YPOS -w $WIDTH -l $LINES -e 'onstart=uncollapse,hide;button1=exit;button2=exec:urxvtc;button3=exit'
