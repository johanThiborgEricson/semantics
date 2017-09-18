describe("Parsing", function() {
  
  it("a character returns the match", function() {
    expect(new CodePointer("a").parse(/a/)[0]).toBe("a");
  });
  
  it("continues where the last parse ended", function() {
    var codePointer = new CodePointer("ab");
    codePointer.parse(/./);
    
    expect(codePointer.parse(/./)[0]).toBe("b");
  });
  
  it("returns null if parsing failed", function() {
    expect(new CodePointer("b").parse(/a/)).toBe(null);
  });
  
  it("can parse an empty string", function() {
    expect(new CodePointer("").parse(/(?:)/)[0]).toBe("");
  });
  
  it("can only succeed in the current position", function() {
    expect(new CodePointer("ba").parse(/a/)).toBe(null);
  });
  
});
