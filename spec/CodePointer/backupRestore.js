describe("CodePointer", function() {
  it("has methods backup and restore that makes it forget intermediate " + 
  "calls to matchAtPointer", function() {
    var codePointer = new CodePointer("abc");
    var backup = codePointer.backup();
    expect(codePointer.matchAtPointer(/./)[0]).toBe("a");
    expect(codePointer.matchAtPointer(/./)[0]).toBe("b");
    codePointer.restore(backup);
    expect(codePointer.matchAtPointer(/./)[0]).toBe("a");
  });
  
});
