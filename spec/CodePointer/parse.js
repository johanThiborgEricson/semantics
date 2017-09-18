describe("Parsing", function() {
  
  it("a character returns the match", function() {
    var codePointer = new CodePointer("a");
    
    expect(codePointer.parse(/a/)[0]).toBe("a");
  });
  
  it("continues where the last parse ended", function() {
    var codePointer = new CodePointer("ab");
    codePointer.parse(/./);
    
    expect(codePointer.parse(/./)[0]).toBe("b");
  });
  
});
