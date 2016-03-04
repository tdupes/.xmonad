#!/bin/bash

background="#1f1f1f"
foreground="#6d715e"
highlight="#c0b18b"

#XPOS=$(xdotool getmouselocation | awk -F " " '{print $1}' | cut -d ":" -f 2)
YPOS="12"
HEIGHT="12"
XOFFSET="0"

# no longer make it resize to my 4k moniter, just keep it on laptop screen
if [[ ! -z `xrandr | grep " connected" | grep "$DP1" | grep "3840x2160"` ]]; then
    XOFFSET="625"
fi

#FONT="-artwiz-lime-medium-r-normal-*-10-110-75-75-m-50-iso8859-*"
#FONT="-*-dweep-medium-r-semicondensed-*-11-*-*-*-*-*-*-*"
FONT="xft:Inconsolata:style=Semibold:pixelsize=20:antialias=true:hinting=slight"
#FONT="-artwiz-limey-medium-r-normal-*-10-110-75-75-m-50-iso8859-*"
#FONT="-*-tamsyn-medium-r-normal-*-10-110-75-75-m-50-iso8859-*"
#FONT='-*-lemon-*-*-*-*-*-*-75-75-*-*-*-*'
#FONT="-*-tewi-medium-*-normal-*-*-*-*-*-*-*-*-*"
white0="#775759"

bar_bg="#282828"
bar_fg="#ebdbb2" 
notify="#d65d0e"
warning="#98971a"
