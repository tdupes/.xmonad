import XMonad
import XMonad.Actions.CycleWS
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.ManageDocks
import XMonad.Util.Run(spawnPipe)
import XMonad.Util.EZConfig(additionalKeys)
import System.IO
import XMonad.Layout.Spacing
import XMonad.Config.Gnome
import XMonad.Layout.Fullscreen  (fullscreenEventHook, fullscreenManageHook, fullscreenFull, fullscreenFloat)
import XMonad.Hooks.ManageHelpers (doCenterFloat, (/=?), isInProperty, isFullscreen, (-?>), doFullFloat, composeOne)
import XMonad.Layout.NoBorders
import XMonad.Hooks.SetWMName
import XMonad.Actions.WindowGo
import qualified XMonad.StackSet as W
import qualified Data.Map as M



myWorkspaces :: [String]
myWorkspaces = ["one", "two", "three", "four", "five"] ++ map show [6..9]

------------------------------------------------------------------------
-- Layouts
-- You can specify and transform your layouts by modifying these values.
-- If you change layout bindings be sure to use 'mod-shift-space' after
-- restarting (with 'mod-q') to reset your layout state to the new
-- defaults, as xmonad preserves your old layout settings by default.
--
-- The available layouts. Note that each layout is separated by |||,
-- which denotes layout choice.
--
-- defaultLayouts = avoidStruts (
--     Tall 1 (3/100) (1/2) |||
--     Mirror (Tall 1 (3/100) (1/2)) |||
--     tabbed shrinkText tabConfig |||
--     Full |||
--     spiral (6/7)) |||
--     noBorders (fullscreenFull Full)
    

--------------------------------------------------------------------------
-- Colors and borders
--
myNormalBorderColor = "#002b36"
myFocusedBorderColor = "#657b83"

--------------------------------------------------------------------------


-- Colors for text and backgrounds of each tab when in "Tabbed" layout.
-- tabConfig = defaultTheme {
--     activeBorderColor = "#7C7C7C",
--     activeTextColor = "#CEFFAC",
--     activeColor = "#000000",
--     inactiveBorderColor = "#7C7C7C",
--     inactiveTextColor = "#EEEEEE",
--     inactiveColor = "#000000"
-- }

----------------------------------------------------------------------------
-- Color of current window title in xmobar.
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
myDisplayBrightnessUp    = "xbacklight -inc 5" -- && backlight_popup.sh"
myDisplayBrightnessDown  = "xbacklight -dec 5" -- && backlight_popup.sh"
myKeyboardBrightnessUp   = "kbdlight up"
myKeyboardBrightnessDown = "kbdlight down"
myTerminal = "/usr/bin/urxvt -e zsh"
myFocusFollowsMouse = False
myKeys =  keys defaultConfig
------------------------------------------------------------------------------

myLayout = avoidStruts  ( {-tiled ||| -} smallspacing |||  nospace ||| Mirror nospace ||| Full) |||
           noBorders (fullscreenFull Full)
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
               [
                className =? "Gimp" --> doFloat
                , className =? "lighthouse" --> doFloat
                , className =? "nemo" --> doFloat
                , className =? "nautilus" --> doFloat
                , className =? "Nautilus" --> doFloat
                , className =? "nm-applet" --> doFloat
               ]
               <+>
               composeOne [ isFullscreen -?> doFullFloat ]

                
main :: IO ()
main = do
    xmproc <- spawnPipe "/usr/bin/xmobar /home/thomasduplessis/.xmobarrc"
    spawn "feh --bg-scale /home/thomasduplessis/Pictures/solarized.jpg &"
    xmonad $ defaults
        {
          manageHook =  myManageHook <+> manageDocks,
          layoutHook = myLayout,
          logHook = dynamicLogWithPP xmobarPP {
                      ppOutput = hPutStrLn xmproc,
                      ppTitle = xmobarColor "#657b83" "" . shorten 100,
                      ppCurrent = xmobarColor "#c0c0c0" "" . wrap "" "",
                      ppSep     = xmobarColor "#c0c0c0" "" " | ",
                      ppUrgent  = xmobarColor "#ff69b4" "",
                      ppLayout = const "" --to disavle the layout info on xmobar
                    } ,

--          keys =    keys defaultConfig,
          startupHook = setWMName "LG3D"
        } `additionalKeys` morekeys


defaults = defaultConfig {
  terminal           = myTerminal,
  focusFollowsMouse  = myFocusFollowsMouse,
  borderWidth        = myBorderWidth,
  modMask            = myModMask,
  workspaces         = myWorkspaces,
  normalBorderColor  = myNormalBorderColor,
  focusedBorderColor = myFocusedBorderColor,
  keys               = myKeys
--  mouseBindings      = myMouseBindings
  }





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
       ((mod4Mask, xK_x), spawn "lighthouse | sh"),

       --toggle spaces in between windows
       ((mod4Mask, xK_b), sendMessage ToggleStruts),

       --my volume control
       ((0, 0x1008FF11), spawn myVolumeDown),
       ((0, 0x1008FF13), spawn myVolumeUp),
       ((0, 0x1008FF12), spawn myToggleMute),
       ((0, 0x1008FF05), spawn myDisplayBrightnessUp),
       ((0, 0x1008FF04), spawn myDisplayBrightnessDown),
       --systen stuff ie logout, suspend, etc.
       ((mod4Mask .|. shiftMask, xK_l), spawn "pmi action logout"),
       ((mod4Mask .|. shiftMask, xK_s), spawn "pmi action suspend"),
       ((mod4Mask .|. shiftMask, xK_h), spawn "pmi action hibernate"),
       ((myModMask, xK_e) , runOrRaise emacs (className =? "Emacs")),
       ((myModMask , xK_f), runOrRaise myBrowser (className =? "Firefox")),
       --switch workspaces
       ((mod4Mask .|. controlMask, xK_Right), shiftToNext >> nextWS),
       ((mod4Mask .|. controlMask, xK_Left),   shiftToPrev >> prevWS)
    ]

