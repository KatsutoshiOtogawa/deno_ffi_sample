import os
import platform
from ctypes import cdll, CDLL, POINTER,c_int64, c_void_p, c_char_p


def _load() -> CDLL:

    libname = ''
    if platform.system() == 'Linux':
        libname = os.path.join(os.path.dirname(__file__), '../out/linux/dotnet_sample.so')
    elif platform.system() == 'Mac':
        libname = os.path.join(os.path.dirname(__file__), '../out/mac/dotnet_sample.dylib')
    elif platform.system() == 'Windows':
        libname = os.path.join(os.path.dirname(__file__), '../dotnet_sample/bin/Release/net7.0/win-x64/publish/dotnet_sample.dll')
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
