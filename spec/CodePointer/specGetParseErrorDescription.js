describe("CodePointer.getParseErrorDescription()", function() {
  it("tells what it expected and what it saw", function() {
    var codePointer = CodePointer("ab");
    codePointer.matchAtPointer(/a/);
    codePointer.matchAtPointer(/c/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^c/ to match 'b'.");
  });
  
  it("ignores calls with longer actuall code", function(){
    var codePointer = CodePointer("abc");
    codePointer.matchAtPointer(/a/);
    var backup = codePointer.backup();
    codePointer.matchAtPointer(/b/);
    codePointer.matchAtPointer(/d/);
    codePointer.restore(backup);
    codePointer.matchAtPointer(/e/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^d/ to match 'c'.");
  });
  
  it("remembers calls with actuall code of equal length (for alternatives)", 
  function(){
    var codePointer = CodePointer("ab");
    codePointer.matchAtPointer(/a/);
    codePointer.matchAtPointer(/c/);
    codePointer.matchAtPointer(/d/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^c|d/ to match 'b'.");
  });
  
  it("forgets remembered token if called with shorter actuall code", 
  function(){
    var codePointer = CodePointer("abc");
    codePointer.matchAtPointer(/a/);
    var backup = codePointer.backup();
    codePointer.matchAtPointer(/e/);
    codePointer.restore(backup);
    codePointer.matchAtPointer(/b/);
    codePointer.matchAtPointer(/d/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^d/ to match 'c'.");
  });
  
});
