module TomsXmonadConfig where

import XMonad
import XMonad.Actions.CycleWS
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.ManageDocks
import XMonad.Util.Run(spawnPipe)
import XMonad.Util.EZConfig
import System.IO
import XMonad.Layout.Spacing
import XMonad.Config.Gnome
import XMonad.Layout.Fullscreen  (fullscreenEventHook, fullscreenManageHook, fullscreenFull, fullscreenFloat)
import XMonad.Hooks.ManageHelpers (doCenterFloat, (/=?), isInProperty, isFullscreen, (-?>), doFullFloat, composeOne)
import XMonad.Layout.NoBorders
import XMonad.Hooks.SetWMName
import XMonad.Actions.WindowGo
import XMonad.Hooks.EwmhDesktops hiding (fullscreenEventHook)
import qualified XMonad.StackSet as W
import qualified Data.Map as M
import XMonad.Hooks.FadeInactive
import Graphics.X11.ExtraTypes.XF86


myWorkspaces :: [String]
myWorkspaces = clickable $ ["i"
		,"ii"	
		,"iii"	
		,"iv"	
		,"v"
		,"vi"]	
	where clickable l = [ "^ca(1,xdotool key alt+" ++ show (n) ++ ")" ++ ws ++ "^ca()" |
				(i,ws) <- zip [1..] l,
				let n = i ]
--------------------------------------------------------------------------
-- Colors and borders
--
myNormalBorderColor = "#002b36"
myFocusedBorderColor = "#657b83"

--------------------------------------------------------------------------

-- Color of current window title in xmobar.
xmobarTitleColor :: [Char]
xmobarTitleColor = "green"

-- Color of current workspace in xmobar.
xmobarCurrentWorkspaceColor = "#CEFFAC"

-- Width of the window border in pixels.
myBorderWidth = 1

myModMask                = mod4Mask -- set Meta to windows key
emacs                    = "emacs"
myBrowser                = "firefox"
myVolumeUp               = "amixer set Master 5+" -- && volume_popup.sh"
myVolumeDown             = "amixer set Master 5-" -- && volume_popup.sh"
myToggleMute             = "amixer set Master toggle  " -- && volume_popup.sh"
myDisplayBrightnessUp    = "xbacklight -inc 20" -- && backlight_popup.sh"
myDisplayBrightnessDown  = "xbacklight -dec 20" -- && backlight_popup.sh"
myKeyboardBrightnessUp   = "kbdlight up"
myKeyboardBrightnessDown = "kbdlight down"
myTerminal               = "/usr/bin/urxvt -e zsh"
myFocusFollowsMouse      = False
myKeys                   = keys defaultConfig
------------------------------------------------------------------------------

myLayout = avoidStruts  (smallspacing |||  nospace ||| Mirror nospace ||| Full) |||
           noBorders Full
     where
       -- default tiling algorithm partitions the screen into two panes
       tiled = smartSpacing 20 $ Tall nmaster delta ratio
       smallspacing = smartSpacing 10 $ Tall nmaster delta ratio
       nospace = Tall nmaster delta ratio
       -- The default number of windows in the master pane
       nmaster = 1
       -- Default proportion of screen occupied by master pane
       ratio = 1/2
       -- Percent of screen to increment by when resizing panes
       delta = 3/100
       

myManageHook = composeAll
               [  className =? "Gimp" --> doFloat
                , className =? "lighthouse" --> doFloat
                , className =? "nautilus" --> doFloat
                , className =? "Nautilus" --> doFloat
                , className =? "nm-applet" --> doFloat
               ]
               <+>
               composeOne [ isFullscreen -?> doFullFloat ]

myXmonadBar = "dzen2 -x '0' -y '0' -w '1600' -ta 'l' -fg '"++foreground++"' -bg '"++background++"' -fn "++myFont
myStatusBar = "/home/tom/.xmonad/status_bar '" ++ foreground ++ "' '" ++ background ++ "' " ++ myFont
                
main :: IO ()
main = do
    dzenLeftBar <- spawnPipe myXmonadBar
    dzenRightBAr <- spawnPipe myStatusBar    
    spawn "feh --bg-scale /home/tom/Pictures/Lake-Mountain.jpg &"
    spawn "systemctl start wicd"
    spawn "systemctl enable wicd"
    xmonad $ ewmh defaults {
          manageHook =  myManageHook <+> manageDocks
          , layoutHook = myLayout
          , logHook = myLogHook dzenLeftBar -- >> fadeInactiveLogHook 0xdddddddd
          , startupHook = setWMName "LG3D"
        } `additionalKeys` morekeys


defaults = defaultConfig {
  terminal           = myTerminal,
  focusFollowsMouse  = myFocusFollowsMouse,
  borderWidth        = myBorderWidth,
  modMask            = myModMask,
  workspaces         = myWorkspaces,
  normalBorderColor 	= color0,
  focusedBorderColor  	= color8,
  keys               = myKeys
  }


--Bar
myLogHook :: Handle -> X ()
myLogHook h = dynamicLogWithPP ( defaultPP
	{
		  ppCurrent		= dzenColor color15 background .	pad
		, ppVisible		= dzenColor color14 background . 	pad
		, ppHidden		= dzenColor color14 background . 	pad
		, ppHiddenNoWindows	= dzenColor background background .	pad
		, ppWsSep		= ""
		, ppSep			= "    "
		, ppLayout		= wrap "^ca(1,xdotool key alt+space)" "^ca()" . dzenColor color2 background . id
		, ppTitle	=  wrap "^ca(1,xdotool key alt+shift+x)" "^ca()" . dzenColor color15 background . shorten 60 . pad
		, ppOrder	=  \(ws:l:t:_) -> [ws,l, t]
		, ppOutput	=   hPutStrLn h
	} )

 
morekeys :: [((KeyMask, KeySym), X())]
morekeys = [
       ((mod4Mask .|. shiftMask, xK_z), spawn "xscreensaver-command -lock"),

       -- print screens
          -- print focused window
       ((controlMask, xK_Print),
                 spawn "sleep 0.2; scrot window_%Y-%m-%d-%H-%M-%S.png -d 1-u"),
          -- print entire screen
       ((0, xK_Print), spawn "gnome-screenshot"),

       -- This is a cool program that acts like Alfred for Mac
--       ((mod4Mask, xK_x), spawn "lighthouse | sh"),
       ((mod4Mask, xK_x), spawn "gmrun"),
       --toggle spaces in between windows
       ((mod4Mask, xK_b), sendMessage ToggleStruts),

       --my volume control
       ((0, 0x1008FF11), spawn myVolumeDown),
       ((0, 0x1008FF13), spawn myVolumeUp),
       ((0, 0x1008FF12), spawn myToggleMute),
       ((0, xF86XK_MonBrightnessUp), spawn myDisplayBrightnessUp),
       ((0, xF86XK_MonBrightnessUp), spawn myDisplayBrightnessDown),
       
       --systen stuff ie logout, suspend, etc.
       ((mod4Mask .|. shiftMask, xK_l), spawn "systemctl logout"),
       ((mod4Mask .|. shiftMask, xK_s), spawn "systemctl suspend"),
       ((mod4Mask .|. shiftMask, xK_h), spawn "systemctl hibernate"),
       ((myModMask, xK_e) , runOrRaise emacs (className =? "Emacs")),
       ((myModMask , xK_f), runOrRaise myBrowser (className =? "Firefox")),
       
       --switch workspaces
       ((mod4Mask .|. controlMask, xK_Right), shiftToNext >> nextWS),
       ((mod4Mask .|. controlMask, xK_Left),   shiftToPrev >> prevWS)
    ]

myBitmapsDir	= "~/.xmonad/dzen2/"

myFont = "xft:Inconsolata:style=Semibold:pixelsize=20:antialias=true:hinting=slight"
--myFont 		= "-*-tamsyn-medium-r-normal-*-12-87-*-*-*-*-*-*"
--myFont = "-*-terminus-medium-*-normal-*-9-*-*-*-*-*-*-*"
--myFont		= "-*-nu-*-*-*-*-*-*-*-*-*-*-*-*"

-- EROSION EDIT
background= "#3f3f3f"
foreground= "#D6C3B6"
color0=  "#332d29"
color8=  "#817267"
color1=  "#8c644c"
color9=  "#9f7155"
color2=  "#746C48"
color10= "#9f7155"
color3=  "#bfba92"
color11= "#E0DAAC"
color4=  "#646a6d"
color12= "#777E82"
color5=  "#766782"
color13= "#897796"
color6=  "#4B5C5E"
color14= "#556D70"
color7=  "#504339"
color15= "#9a875f"
