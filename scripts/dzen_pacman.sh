#!/bin/bash
source $(dirname $0)/config.sh
XPOS=$((2570 + $XOFFSET))
WIDTH="550"
LINES=3

updates=$(pacman -Qu | wc -l)
packages=$(pacman -Qq  | wc -l)

(echo "^fg($white)Updates";  echo " "; echo "^fg($white0) You have $updates updates available out of  $packages packages";sleep 15) | dzen2 -fg $foreground -bg $background -fn $FONT -x $XPOS -y $YPOS -w $WIDTH -l $LINES -e 'onstart=uncollapse,hide;button1=exit;button2=exec:urxvtc;button3=exit'
