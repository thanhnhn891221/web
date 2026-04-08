import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#B91C1C', // primary-700
          borderRadius: '25%', // Slight rounded square / squircle
          border: '2px solid #FFD700', // Gold border
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            fontSize: '20px',
            fontWeight: 900,
            color: 'white',
            lineHeight: 1,
            marginTop: '2px', // optical alignment
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size }
  );
}
