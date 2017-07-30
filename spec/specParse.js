describe("CodePointer(ignore + lexeme + code)" + 
".parse(/ignore(token1)...(tokenN)/)", function() {

  it("when code = '' returns makes getUnparsed return ''", function() {
    var code = CodePointer("ignore" + "lexeme 1");
    expect(code.parse(/ignore(lexeme 1)/)).toEqual(["lexeme 1"]);
    expect(code.getUnparsed()).toEqual("");
  });
  
  it("when code = 'code' makes getUnparsed return 'code'", function() {
    var code = CodePointer("ignore" + "lexeme 1" + "code");
    expect(code.parse(/ignore(lexeme 1)/)).toEqual(["lexeme 1"]);
    expect(code.getUnparsed()).toEqual("code");
  });
  
  it("if ignore = '', when called with code + lexeme1 returns null", function() {
    var code = CodePointer("code" + "lexeme 1");
    expect(code.parse(/(lexeme 1)/)).toBe(null);
  });
  
  it("if n > 1, returns all captured groups", function(){
    var code = CodePointer("lexeme 1" + "lexeme 2");
    expect(code.parse(/(lexeme 1)(lexeme 2)/)).toEqual(["lexeme 1", "lexeme 2"]);
  });
  
  it("returns null when code doesn't match token", function() {
    expect(CodePointer("nonsense").parse(/(lexeme 1)/)).toBe(null);
  });
  
  it("handles multiple calls with regexp with global flag = true, resets start index");
  
});
