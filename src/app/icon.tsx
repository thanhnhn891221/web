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
          background: '#054f31',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}
          >
            AIO
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1,
              marginTop: '1px',
            }}
          >
            .MS
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
