--  module TomsConfig where
--can't ahve this file for xmoand to recompile for some reason

import XMonad
import XMonad.Actions.CycleWS
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.ManageDocks
import XMonad.Util.Run(spawnPipe)
import XMonad.Util.EZConfig
import System.IO
import XMonad.Layout.Spacing
import XMonad.Layout.Fullscreen(fullscreenEventHook, fullscreenManageHook,
                                fullscreenFull, fullscreenFloat)
import XMonad.Hooks.ManageHelpers (doCenterFloat, (/=?),
                                   isInProperty, isFullscreen, (-?>), doFullFloat, composeOne)

import XMonad.Layout.Gaps
import qualified System.Dzen as DZ
import qualified System.Dzen.Graphics as DG

import XMonad.Layout.NoBorders
import XMonad.Hooks.SetWMName
import XMonad.Actions.WindowGo
import XMonad.Hooks.EwmhDesktops hiding (fullscreenEventHook)
import qualified XMonad.StackSet as W
import qualified Data.Map as M
import XMonad.Hooks.FadeInactive
import Graphics.X11.ExtraTypes.XF86
import XMonad.Layout.Spiral

import Data.Monoid
import Data.Char (toLower)

myWorkspaces :: [String]
myWorkspaces = clickable $ ["I", "II", "III", "IV", "V", "VI"]
  where clickable l = [ "^ca(1,xdotool key super+" ++ show n ++ ")" ++ ws ++ "^ca()" |
                        (i,ws) <- zip [1..] l,
                                 let n = i ]
--------------------------------------------------------------------------

-- Width of the window border in pixels.
myBorderWidth :: Dimension
myBorderWidth = 5


-- set Meta to windows key
myModMask :: KeyMask
myModMask = mod4Mask

emacs, myBrowser, myVolumeUp, myVolumeDown,myToggleMute, myDisplayBrightnessUp, myDisplayBrightnessDown, myTerminal :: String
emacs                    = "emacs"
myBrowser                = "firefox"
myVolumeUp               = "amixer set Master 5+" -- && volume_popup.sh"
myVolumeDown             = "amixer set Master 5-" -- && volume_popup.sh"
myToggleMute             = "amixer set Master toggle  " -- && volume_popup.sh"
myDisplayBrightnessUp    = "xbacklight -inc 5" -- && backlight_popup.sh"
myDisplayBrightnessDown  = "xbacklight -dec 5" -- && backlight_popup.sh"
myTerminal               = "/usr/bin/urxvt -e zsh"

myFocusFollowsMouse :: Bool
myFocusFollowsMouse = False

myKeys :: XConfig Layout -> M.Map (ButtonMask, KeySym) (X ())
myKeys                   = keys defaultConfig
------------------------------------------------------------------------------

myLayout =  avoidStruts $  smartBorders (mainGaps
                                         ||| secondaryGaps -- ||| tiled
                                         ||| fullGaps
                                         ||| spiralLayout
                                         ||| Full )
     where
       mygaps        = gaps [(U,180), (R,80), (L,80), (D,60)] 
       mainGaps      = mygaps tiled
       secondaryGaps = mygaps spiralLayout
       fullGaps      = mygaps Full
       tiled         = smartSpacing 40 $ Tall nmaster delta ratio
       spiralLayout  = spiral (5/7)
       nmaster       = 1    -- The default number of windows in the master pane
       ratio         = 1/2    -- Default proportion of screen occupied by master pane
       delta         = 3/100  -- Percent of screen to increment by when resizing panes
       

myManageHook :: Query (Data.Monoid.Endo WindowSet)
myManageHook = composeAll
               [  className =? "Gimp" --> doFloat
                , className =? "lighthouse" --> doFloat
                , className =? "nautilus" --> doFloat
                , className =? "Nautilus" --> doFloat
                , className =? "nm-applet" --> doFloat
                , className =? "wicd-client" --> doFloat
               ]
               <+>
               composeOne [ isFullscreen -?> doFullFloat ]

myXmonadBar, myStatusBar :: String
myXmonadBar = "dzen2 -x '80' -y '60' -h '80' -w '2000' -ta 'l' -fg '"++ foreground ++
              "' -bg '"  ++ background ++ "' -fn "++myFont
myStatusBar = "/home/tom/.xmonad/status_bar '" ++ blue ++ "' '" ++ background ++ "' " ++ myFont
                
main :: IO ()
main = do
--  dzenLeftBar <- spawnPipe myXmonadBar
  dzenRightBar <- spawnPipe myStatusBar    
  spawn "feh --randomize --bg-scale /home/tom/Pictures/Wallpapers/4K/* &"
  spawn "systemctl start wicd"
  spawn "systemctl enable wicd"
  spawn "wmname LG3D."
  altmain
  -- xmonad $ ewmh defaults {
  --  logHook = myLogHook dzenLeftBar -- >> fadeInactiveLogHook 0xdddddddd
  --   }


altmain :: IO ()
altmain = xmonad =<< statusBar myXmonadBar myPP toggleStrutsKey defaults

toggleStrutsKey :: XConfig t -> (KeyMask, KeySym)
toggleStrutsKey XConfig {XMonad.modMask = mask} = (mask, xK_b)


defaults = defaultConfig {
  terminal           = myTerminal,
  focusFollowsMouse  = myFocusFollowsMouse,
  borderWidth        = myBorderWidth,
  modMask            = myModMask,
  workspaces         = myWorkspaces,
  normalBorderColor  = color0,
  focusedBorderColor = fg1,
  keys               = myKeys,
  manageHook =  myManageHook <+> manageDocks,
  startupHook = setWMName "LG3D",
  layoutHook = myLayout
}   `additionalKeys` morekeys


-- PP that determines what is being outputted to the Bar
myPP :: PP
myPP = dzenPP {
        ppCurrent = dzenColor bg blue . pad 
      , ppVisible = dzenColor blue fg4 . pad
      , ppHidden = dzenColor blue fg4 . pad
      , ppHiddenNoWindows = dzenColor bg3 fg4 . pad 
      , ppWsSep = ""
      , ppSep =  ""
      , ppLayout = wrap "^ca(1,xdotool key super+space)" "^ca()" .
                   dzenColor bg3 bg1 .
                   wrap " " " " . 
                   map toLower
      , ppTitle =  wrap "^ca(1,xdotool key super+shift+x)" "^ca()" .
                   dzenColor bg2 bg0 . shorten 200 . pad
      , ppOrder =  \(ws:l:t:_) -> [ws,l, t]
      }
--Bar
myLogHook :: Handle -> X ()
myLogHook h = dynamicLogWithPP (myPP {
                                    ppOutput = hPutStrLn h
                                    } )

morekeys :: [((KeyMask, KeySym), X ())]
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
--       ((mod4Mask, xK_x), spawn "albert"),
       --toggle spaces in between windows
       ((mod4Mask, xK_b), sendMessage ToggleStruts),

       --my volume control
       ((0, 0x1008FF11), spawn myVolumeDown),
       ((0, 0x1008FF13), spawn myVolumeUp),
       ((0, 0x1008FF12), spawn myToggleMute),
       ((0, xF86XK_MonBrightnessUp), spawn myDisplayBrightnessUp),
       ((0, xF86XK_MonBrightnessDown), spawn myDisplayBrightnessDown),
       
       --systen stuff ie logout, suspend, etc.
       ((mod4Mask .|. shiftMask, xK_l), spawn "systemctl logout"),
       ((mod4Mask .|. shiftMask, xK_s), spawn "systemctl suspend"),
       ((mod4Mask .|. shiftMask, xK_h), spawn "systemctl hibernate"),
--       ((myModMask, xK_e) , runOrRaise emacs (className =? "Emacs")),
       ((myModMask , xK_f), runOrRaise myBrowser (className =? "Firefox")),
       
       --switch workspaces
       ((mod4Mask .|. controlMask, xK_Right), shiftToNext >> nextWS),
       ((mod4Mask .|. controlMask, xK_Left),   shiftToPrev >> prevWS)
    ]

myBitmapsDir :: String
myBitmapsDir = "~/.xmonad/dzen2/"

myFont :: String
-- myFont = "xft:Sauce\\ Code\\ Powerline\\ Black:style=Regular:pixelsize=40:antialias=true:hinting=slight"
--myFont = "xft:MesloLGLRegularforPowerline:style=Regular:pixelsize=40:antialias=true:hinting=slight"
--myFont = "xft:DejavuSansMonoforPowerline:style=Semibold:pixelsize=40:antialias=true:hinting=slight"
--myFont = "-*-tamsyn-medium-r-normal-*-12-87-*-*-*-*-*-*"
myFont = "-*-terminus-medium-*-normal-*-30-*-*-*-*-*-*-*"
--myFont = "-*-nu-*-*-*-*-*-*-*-*-*-*-*-*"
myFont2  ="-*-tamsyn-medium-r-normal-*-12-*-*-*-*-*-*-1"
-- GruvBox EDIT

background = "#282828"
foreground = "#ebdbb2"


bg = "#282828"     -- 0            

red = "#cc241d"    -- 1
green = "#98971a"  -- 2
yellow= "#d79921"  -- 3
blue = "#458588"   -- 4
purple = "b16286"  -- 5
aqua = "#689d61"   -- 6
gray = "#a89984"   -- 7

gray2 = "#928374"   -- 8
red2 = "#fb4934"   -- 9
green2 = "#fabd2f" -- 10
yellow2 = "#fabd2f"-- 11
blue2 = "#83a598"  -- 12
purple2 = "#d3869b"-- 13
aqua2 = "#83c07c"  -- 14

fg = "#ebdbb2" -- 15

bg0_h = "#1d2021" -- 
bg0 = "#282828"
bg1 = "#3c3836"
bg2 = "#504945"
bg3 = "#665c54"
bg4 = "#7c6f64"
gray3 = "#928374"
orange = "#d65d0e"
bg0_s = "#32302f"
fg4 = "#a89984"
fg3 = "#bdae93"
fg2 = "#d5c4a1"
fg1 = "#ebdbb2"
fg0 = "#fbf1c7"

orange2 = "#fe8019"

color0 =  "#332d29" -- unfocused window color
