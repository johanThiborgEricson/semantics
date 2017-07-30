describe("StubLexeme_dConcatenator", function() {
  
  it("(StubLexeme_dConcatenator spike)", function() {
    var thisBinding = {con: "value 0"};
    var stub = StubLexeme_dConcatenator();
    var code = StubCodePointer("lexeme 1" + "code");
    var instruction = stub(code);
    expect(code.getUnparsed()).toEqual("code");
    instruction(thisBinding);
    expect(thisBinding.con).toEqual("value 0" + "lexeme 1");
  });
  
});
