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

# library.Free(bbb)
