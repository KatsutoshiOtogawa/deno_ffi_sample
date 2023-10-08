// extern crate libc;

// use libc::{c_int, c_char};
use std::str;
use std::io::Read;
use std::net::{TcpStream, SocketAddr};
use ssh2::Session;
use std::ffi::CString;

#[derive(Debug)]
#[repr(C)]
pub struct CommandOutput {
  status: i32,
  stdout: *mut i8,
  stderr: *mut i8,
}

/// # Safety
///
/// The pointer to the buffer must be valid and initialized, and the length must
/// not be longer than the buffer's allocation.
#[no_mangle]
pub unsafe extern "C" fn print_buffer(ptr: *const u8, len: usize) {
  let buf = std::slice::from_raw_parts(ptr, len);
  println!("{buf:?}");
}

#[no_mangle]
pub extern "C" fn drop_string_ffi(ptr: *mut i8) {
    let bytes = unsafe { CString::from_raw(ptr) };
    drop(bytes);
}

pub fn buf2strref<'a>(buf: *const u8, len: u32) -> &'a str{

  let byte_slice: &[u8] = unsafe {

    // スライスの長さがわからないため長さも送る。
    // &[u8] スライスに変換
    std::slice::from_raw_parts(buf, len as usize)
  };

  // &[u8] スライスから &str に変換
  let str_slice: &str = unsafe {
    // ffiから渡した文字列はチェックしない。
      str::from_utf8_unchecked(byte_slice)
  };

  return str_slice;
}

pub fn string2constu8(string: String) -> (*const u8, usize){
  // Stringを&[u8]に変換
  let bytes_slice: &[u8] = (&string).as_bytes();

  let length = bytes_slice.len();
  // &[u8]から*const u8に変換
  let raw_ptr: *const u8 = bytes_slice.as_ptr();

  (raw_ptr, length)
}

/// Println binary data like the od command. can be used to verify that you are passing binaries correctly as ffi.
///
/// # Arguments
/// 
/// * `buf` - check
/// 
/// # Examples
///
/// ```
/// use ssh2::od;
///
/// od(buf);
/// ```
pub fn od(buf: &str) {

  let bytes = buf.as_bytes();

  for byte in bytes {
    print!("{:02X} ", byte);
  }
  println!();
}

/// Connect ssh server.
///
/// # Examples
///
/// ```
/// use ssh2::connect;
///
/// connect(username, password, addr);
/// ```
#[no_mangle]
pub extern "C" fn connect(username: *const u8,username_len: u32, password: *const u8, password_len: u32, addr_octet: u8, addr_octet2: u8, addr_octet3: u8, addr_octet4: u8, port: u16) -> bool{

  let username_slice = buf2strref(username, username_len);
  let password_slice = buf2strref(password, password_len);

  println!("username: {username_slice}");
  println!("password: {password_slice}");
  let addrs = [
    SocketAddr::from(([addr_octet, addr_octet2, addr_octet3, addr_octet4], port)),
  ];
  let tcp = TcpStream::connect(&addrs[..]).unwrap();
  let mut sess = Session::new().unwrap();
  sess.set_tcp_stream(tcp);

  sess.handshake().unwrap();

  sess.userauth_password(username_slice, password_slice).unwrap();

  return sess.authenticated();
}

#[no_mangle]
pub extern "C" fn send_command(username: *const u8,username_len: u32, password: *const u8, password_len: u32, addr_octet: u8, addr_octet2: u8, addr_octet3: u8, addr_octet4: u8, port: u16, command: *const u8, command_len: u32) -> CommandOutput{

  let username_slice = buf2strref(username, username_len);
  let password_slice = buf2strref(password, password_len);
  let command_slice = buf2strref(command, command_len);

  let addrs = [
    SocketAddr::from(([addr_octet, addr_octet2, addr_octet3, addr_octet4], port)),
  ];
  let tcp = TcpStream::connect(&addrs[..]).unwrap();
  let mut sess = Session::new().unwrap();
  sess.set_tcp_stream(tcp);

  sess.handshake().unwrap();

  sess.userauth_password(username_slice, password_slice).unwrap();

  let mut channel = sess.channel_session().unwrap();

  channel.exec(command_slice).unwrap();
  let mut s = String::new();
  channel.read_to_string(&mut s).unwrap();

  // 標準出力
  // let stdout = channel.stream(0);

  // println!("s: {s}, length: {}", s.len());
  channel.wait_close().unwrap();

  let status = channel.exit_status().unwrap();
  
  let stdout = CString::new(s).unwrap().into_raw();

  let stderr = CString::new("").unwrap().into_raw();

  CommandOutput { stdout, stderr, status}
}
