import * as Slider from '@radix-ui/react-slider';

export default function PitchSlider({ value, onChange, max }) {
  const safeMax = max || 5000;

  return (
    <div className="flex items-center gap-3 min-w-0 w-full">
      <span className="text-xs text-steel-400 whitespace-nowrap flex-shrink-0">Min pitches</span>
      <Slider.Root
        min={0}
        max={safeMax}
        step={100}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="relative flex items-center select-none touch-none flex-1 h-5 min-w-0"
      >
        <Slider.Track className="bg-navy-600 relative grow rounded-full h-1.5">
          <Slider.Range className="absolute bg-steel-500 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-white border-2 border-steel-500 rounded-full shadow-sm hover:border-steel-400 focus:outline-none focus:ring-2 focus:ring-steel-500/40 transition-colors cursor-pointer"
          aria-label="Minimum pitches"
        />
      </Slider.Root>
      <span className="text-xs text-white font-medium whitespace-nowrap flex-shrink-0 w-10 text-center tabular-nums">
        {value === 0 ? 'All' : `${value.toLocaleString()}+`}
      </span>
    </div>
  );
}
