import os
import platform
from ctypes import cdll, CDLL, POINTER,c_int64, c_void_p, c_char_p


def _load() -> CDLL:

    cpu =  "" 
    if platform.machine() == 'aarch64':
        cpu = 'arm64'
    elif platform.machine() == 'AMD64': 
        cpu = 'x64'
    else:
        raise ValueError("Unsupported cpu!")
    
    libname = ''
    if platform.system() == 'Linux':
        libname = os.path.join(os.path.dirname(__file__), '../dotnet_sample/bin/Release/net7.0/linux-{}/publish/dotnet_sample.so'.format(cpu))
    elif platform.system() == 'Mac':
        libname = os.path.join(os.path.dirname(__file__), '../dotnet_sample/bin/Release/net7.0/mac-{}/publish/dotnet_sample.dylib'.format(cpu))
    elif platform.system() == 'Windows':
        libname = os.path.join(os.path.dirname(__file__), '../dotnet_sample/bin/Release/net7.0/win-{}/publish/dotnet_sample.dll'.format(cpu))
    else:
        raise ValueError("Unsupported OS!")

    library = cdll.LoadLibrary(libname)

    Multiply = library.Multiply
    Multiply.argtypes = [c_int64, c_int64]
    Multiply.restype = c_int64

    Free = library.Free
    Free.argtypes = [c_void_p]
    Free.restype = None

    FreeHGlobal = library.FreeHGlobal
    FreeHGlobal.argtypes = [c_void_p]
    FreeHGlobal.restype = None

    ReturnBuffer = library.ReturnBuffer
    ReturnBuffer.argtypes = None
    # pythonのwchar_pはUTF-32エンコーディングなので注意。
    ReturnBuffer.restype = c_char_p


    return library
