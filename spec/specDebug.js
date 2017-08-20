describe("Debugging messages", function() {
  var they = it;
  var xthey = xit;
  var interpreter;
  var factory = new InterpreterMethodFactory();
  
  beforeEach(function() {
    interpreter = {};
    interpreter.text = factory.terminal(/text/, function() {});
    interpreter.lineBreak = factory.terminal(/\n/, function() {});
    interpreter.paragraph = factory.nonTerminalSequence("text", "lineBreak");
    spyOn(console, "log");
  });
  
  they("can be turned on", function() {
    interpreter.text("text", true);
    
    expect(console.log).toHaveBeenCalled();
  });
  
  they("are turned off by default", function() {
    interpreter.text("text");
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("aren't showed when called externally internally if failing if " + 
  "turned off", 
  function() {
    try {
      interpreter.paragraph("Something else\n");
    } catch(e) {}
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("look like xml and report success when called internally and " + 
  "externally when successful", 
  function() {

    interpreter.paragraph("text\n", true);
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "paragraph");
    expect(console.log).toHaveBeenCalledWith("<%s>", "text");
    expect(console.log).toHaveBeenCalledWith("Successfully parsed %s.", "text");
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
    expect(console.log).toHaveBeenCalledWith("Successfully parsed %s.", 
    "paragraph");
    expect(console.log).toHaveBeenCalledWith("</%s>", "paragraph");
  });
  
  they("look like xml report failure when called internally and externally " + 
  "when failing", 
  function() {

    try {
      interpreter.paragraph("Something else\n", true);
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "paragraph");
    expect(console.log).toHaveBeenCalledWith("<%s>", "text");
    expect(console.log).toHaveBeenCalledWith("Failed to parse %s.", "text");
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
    expect(console.log).toHaveBeenCalledWith("Failed to parse %s.", "paragraph");
    expect(console.log).toHaveBeenCalledWith("</%s>", "paragraph");
  });
  
  // todo: test for match fullness.
  they("if a match is successful, reports success, the regExp, the rest of " + 
  "the current line and the full match", function() {
    interpreter.paragraph("text\n", true);
    
    expect(console.log).toHaveBeenCalledWith("%s.exec(\"%s\")", "/text/", 
    "text");
    expect(console.log).toHaveBeenCalledWith("Matched \"%s\"", "text");
  });
  
  they("if a match fails, reports the failure, the regExp and the rest of " + 
  "the current line", function() {
    try {
      interpreter.paragraph("Something else", true);
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("%s.exec(\"%s\")", "/text/", 
    "Something else");
    expect(console.log).toHaveBeenCalledWith("Match failed");
  });
  
  // todo: the same test when called externally
  they("can tell the name of the called method, even if there are other " + 
  "methods with the same function", function() {
    interpreter.a1 = factory.terminal(/a/, function() {});
    interpreter.a2 = interpreter.a1;
    interpreter.aa = factory.nonTerminalSequence("a1", "a2", function() {});

    interpreter.aa("aa", true);
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "a1");
    expect(console.log).toHaveBeenCalledWith("<%s>", "a2");
  });
  
});
