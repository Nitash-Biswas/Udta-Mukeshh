
const Bird = ({ position, radius, image }) => {
  if (!position) return null;

  const style = {
    position: 'absolute',
    left: `${position.x - radius}px`,
    top: `${position.y - radius}px`,
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    zIndex: 10,
  };

  if (image) {
    return (
      <img
        src={image}
        alt="bird"
        style={{
          ...style,
          objectFit: 'contain', // Keeps aspect ratio, might leave empty space if not perfectly square
          // objectFit: 'fill' // Alternative: stretches image to fill the circle exactly
        }}
      />
    );
  }

  // Fallback if no image is provided
  return (
    <div
      className="bg-red-600 rounded-full border-2 border-red-800 shadow-lg"
      style={style}
    />
  );
};

export default Bird;