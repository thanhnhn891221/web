import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 48,
  height: 48,
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
          background: 'linear-gradient(135deg, #991B1B, #7F1D1D)',
        }}
      >
        {/* Rotated diamond shape like the login page */}
        <div
          style={{
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(45deg)',
            borderRadius: '6px',
            border: '2px solid #FFD700',
            background: 'linear-gradient(135deg, #B91C1C, #991B1B)',
            boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)',
          }}
        >
          <div
            style={{
              transform: 'rotate(-45deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1,
                letterSpacing: '-0.5px',
              }}
            >
              AIO
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
