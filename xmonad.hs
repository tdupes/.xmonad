import XMonad
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.ManageDocks
import XMonad.Util.Run(spawnPipe)
import XMonad.Util.EZConfig(additionalKeys)
import System.IO
import XMonad.Util.Dzen
import Data.Map    (fromList)
import Data.Monoid (mappend)
import XMonad.Actions.Volume
import XMonad.Layout.Spacing

alert = dzenConfig centered . show . round
centered =
        onCurr (center 150 66)
    >=> font "-*-helvetica-*-r-*-*-64-*-*-*-*-*-*-*"
    >=> addArgs ["-fg", "#80c0ff"]
    >=> addArgs ["-bg", "#000040"]

main = do
    xmproc <- spawnPipe "/usr/bin/xmobar /home/thomasduplessis/.xmobarrc"
    xmonad $ defaultConfig
        { manageHook = manageDocks <+> manageHook defaultConfig
        , layoutHook = spacing 10 $ Tall 1 (3/100) (1/2)
                      -- put a 2px space around every window
        , logHook = dynamicLogWithPP xmobarPP
                        { ppOutput = hPutStrLn xmproc
                        , ppTitle = xmobarColor "green" "" . shorten 50
                        }
        
        , terminal = "gnome-terminal"
        , keys =    keys defaultConfig `mappend`
                    \c -> fromList [
                           ((0, 0x1008FF11), setMute False >> lowerVolume 4  >>= alert),
                           ((0, 0x1008FF13), setMute False >> raiseVolume 4  >>= alert),
                           ((0, 0x1008FF12), toggleMute >>= setMute)
                          ]
        , modMask = mod4Mask     -- Rebind Mod to the Windows key
        } `additionalKeys` morekeys


morekeys =[ ((mod4Mask .|. shiftMask, xK_z), spawn "xscreensaver-command -lock")
        , ((controlMask, xK_Print), spawn "sleep 0.2; scrot -s")
        , ((0, xK_Print), spawn "scrot")
        , ((modm, xK_x), spawn "lighthouse | sh")
          ]
