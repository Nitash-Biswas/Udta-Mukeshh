
const Block = ({ position, width, height, image }) => {
  const style = {
    position: 'absolute',
    left: `${position.x - width / 2}px`,
    top: `${position.y - height / 2}px`,
    width: `${width}px`,
    height: `${height}px`,
  };

  if (image) {
    return (
      <div
        style={{
          ...style,

          backgroundImage: `url(${image})`,
          backgroundSize: '900% auto',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#bbbbbb',
        backgroundBlendMode: 'multiply',

        }}
      />
    );
  }

  // Fallback if no image provided
  return (
    <div
      className="bg-slate-900 border-2 border-slate-700"
      style={style}
    />
  );
};

export default Block;