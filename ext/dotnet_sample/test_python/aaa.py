from load_library import load
import ctypes

library = load()

# ReturnBuffer = library.ReturnBuffer
# ReturnBuffer.argtypes = None
# # pythonのwchar_pはUTF-32エンコーディングなので注意。
# ReturnBuffer.restype = ctypes.c_char_p

# aaa: int = library.Multiply(3, 5)

# print(aaa)

# bbb = library.ReturnBuffer

# print(bbb)

# bbb.value.decode('utf-8')

ReturnPointer = library.ReturnPointer

ReturnPointer.argtypes = None
ReturnPointer.restype = ctypes.POINTER(ctypes.c_int64)

pointer = ReturnPointer()


print(pointer)

print(pointer.contents.value)

Free = library.Free

# Free.argtypes = [ctypes.POINTER(ctypes.c_int64)]
Free.argtypes = [ctypes.c_void_p]
Free.restype = None

Free(pointer)

ReturnPointer2 = library.ReturnPointer2

ReturnPointer2.argtypes = None
ReturnPointer2.restype = ctypes.POINTER(ctypes.c_int64)

pointer2 = ReturnPointer2()


print(pointer2.contents.value)

FreeHGlobal = library.FreeHGlobal

# Free.argtypes = [ctypes.POINTER(ctypes.c_int64)]
FreeHGlobal.argtypes = [ctypes.c_void_p]
FreeHGlobal.restype = None

FreeHGlobal(pointer2)

# library.Free(bbb)
