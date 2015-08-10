#! /bin/bash
# this file will create symlinks in the home dir

files=(.vimperatorrc .xmobarrc  .zshrc .gnus .Xdefaults .bashrc .gtkrc-2.0 .xsessionrc .themes/ .vimperator/ .oh-my-zsh/ .config/)

for file in ${files[*]}
do
    echo copyingfile: dotfiles/$file to $HOME
    cp dotfiles/$file ~/
done

