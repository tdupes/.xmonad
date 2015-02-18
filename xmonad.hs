import XMonad
import XMonad.Actions.CycleWS
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.ManageDocks
import XMonad.Util.Run(spawnPipe)
import XMonad.Util.EZConfig(additionalKeys)
import System.IO
import XMonad.Layout.Spacing
import XMonad.Config.Gnome
import XMonad.Layout.Fullscreen
import XMonad.Layout.NoBorders
   
myLayout = avoidStruts  (tiled ||| Mirror tiled ||| Full) ||| noBorders (fullscreenFull Full)  
     where  
       -- default tiling algorithm partitions the screen into two panes  
       tiled = smartSpacing 5 $ Tall nmaster delta ratio  
   
       -- The default number of windows in the master pane  
       nmaster = 1  
   
       -- Default proportion of screen occupied by master pane  
       ratio = 1/2  
   
       -- Percent of screen to increment by when resizing panes  
       delta = 3/100  
    
main :: IO ()
main = do
    xmproc <- spawnPipe "/usr/bin/xmobar /home/thomasduplessis/.xmobarrc"
    --when load up set my background
    spawn "feh --bg-scale /home/thomasduplessis/Pictures/colorful-triangles-background.jpg &"
    xmonad $ gnomeConfig
        {
          manageHook = manageDocks <+> manageHook defaultConfig,
          layoutHook = myLayout,
              --smartSpacing 5 $ Tall 1 (3/100) (1/2),
          logHook = dynamicLogWithPP xmobarPP
                        { ppOutput = hPutStrLn xmproc
                        , ppTitle = xmobarColor "green" "" . shorten 50
                        },
          
          terminal = "gnome-terminal",
          focusFollowsMouse  = False,
          keys =    keys defaultConfig,
          modMask = mod4Mask     -- Rebind Mod to the Windows key
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
       ((mod4Mask .|. shiftMask, xK_p), spawn "sudo poweroff;t79509121"),

       --switch workspaces
       ((mod4Mask .|. controlMask, xK_Right), shiftToNext >> nextWS),
       ((mod4Mask .|. controlMask, xK_Left),   shiftToPrev >> prevWS)
    ]
