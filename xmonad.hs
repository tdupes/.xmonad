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

    
myLayout = avoidStruts  (tiled ||| smallspacing ||| Mirror tiled ||| Full) ||| noBorders (fullscreenFull Full)
     where
       -- default tiling algorithm partitions the screen into two panes
       tiled = smartSpacing 20 $ Tall nmaster delta ratio

       smallspacing = smartSpacing 10 $ Tall nmaster delta ratio
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

                          
mybordercolor = "#606060"
                
main :: IO ()
main = do
    xmproc <- spawnPipe "/usr/bin/xmobar /home/thomasduplessis/.xmobarrc"
    --when load up set my background
    spawn "feh --bg-scale /home/thomasduplessis/Pictures/colorful-triangles-background.jpg &"
    spawn "emacs"
    xmonad $ defaultConfig
        {
          manageHook =  myManageHook <+> manageDocks,
          layoutHook = myLayout,
              --smartSpacing 5 $ Tall 1 (3/100) (1/2),
          logHook = dynamicLogWithPP xmobarPP
                        { ppOutput = hPutStrLn xmproc
                        , ppTitle = xmobarColor "green" "" . shorten 50
                        } ,

          terminal = "urxvt",
          focusFollowsMouse  = True,
          focusedBorderColor = mybordercolor,
          keys =    keys defaultConfig,
          modMask = mod4Mask     -- Rebind Mod to the Windows key
          , startupHook = setWMName "LG3D"
        } `additionalKeys` morekeys

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
       ((0, 0x1008FF11), spawn "amixer set Master 2-"),
       ((0, 0x1008FF13), spawn "amixer set Master unmute" >>
                       spawn "amixer set Master 2+"),
       ((0, 0x1008FF12), spawn "amixer set Master toggle"),

       --systen stuff ie logout, suspend, etc.
       ((mod4Mask .|. shiftMask, xK_l), spawn "pmi action logout"),
       ((mod4Mask .|. shiftMask, xK_s), spawn "pmi action suspend"),
       ((mod4Mask .|. shiftMask, xK_h), spawn "pmi action hibernate"),
       ((myModMask, xk_e) , runOrRaise emacs (className =? "emacs")),
       ((myModMask , xK_f), runOrRaise myBrowser (className =? "Firefox")),
       --switch workspaces
       ((mod4Mask .|. controlMask, xK_Right), shiftToNext >> nextWS),
       ((mod4Mask .|. controlMask, xK_Left),   shiftToPrev >> prevWS)
    ]

mymodmask = mod4Mask
emacs = "emacs"
myBrowser = "firefox"
myVolumeUp = "amixer set Master 10+ " -- && volume_popup.sh"
myVolumeDown = "amixer set Master 10-  " -- && volume_popup.sh"
myToggleMute = "amixer set Master toggle  " -- && volume_popup.sh"
myDisplayBrightnessUp = "xbacklight -inc 10  " -- && backlight_popup.sh"
myDisplayBrightnessDown = "xbacklight -dec 10  " -- && backlight_popup.sh"
myKeyboardBrightnessUp = "kbdlight up"
myKeyboardBrightnessDown = "kbdlight down"
