describe("CodePointer", function() {
  it("has methods backup and restore that makes it forget intermediate " + 
  "calls to parse", function() {
    var codePointer = CodePointer("abc");
    var backup = codePointer.backup();
    expect(codePointer.parse(/(.)/)).toEqual(["a"]);
    expect(codePointer.parse(/(.)/)).toEqual(["b"]);
    codePointer.restore(backup);
    expect(codePointer.parse(/(.)/)).toEqual(["a"]);
  });
  
});
