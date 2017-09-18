describe("Restoring", function() {
  it("goes back to a state that has been backed up", function() {
    var codePointer = new CodePointer("abc");
    var backup = codePointer.backup();
    expect(codePointer.parse(/./)[0]).toBe("a");
    expect(codePointer.parse(/./)[0]).toBe("b");
    codePointer.restore(backup);
    expect(codePointer.parse(/./)[0]).toBe("a");
  });
  
});
