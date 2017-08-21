describe("The nameOf method", function() {
  
  it("returns the name of the given property", function() {
    var factory = new InterpreterMethodFactory();
    var propertyValue = "property value";
    var o = {
      propertyName: propertyValue
    };
    
    expect(factory.nameOf(o, propertyValue)).toBe("propertyName");
  });
  
});
