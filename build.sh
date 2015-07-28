# this file will create symlinks in the home dir

files = .vimperatorrc .xmobarrc  .zshrc .gnus .Xdefaults .bashrc .gtkrc-2.0 .xsessionrc .themes/ .vimperator/ .oh-my-zsh/ .config/ .emacs.d/

for file in $files
do
    ln -s $file ~/
done

