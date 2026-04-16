import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// ✅ Register required elements for Pie Chart
ChartJS.register(ArcElement, Tooltip);

const SummaryChart = ({ passed, warnings, failed, information, total }) => {
  const chartData = {
    labels: ['Passed', 'Warnings', 'Failed', 'Info'],
    datasets: [{
      data: [passed, warnings, failed, information],
     backgroundColor: [
        'rgba(76, 175, 80, 0.5)',    // green 80% opacity
        'rgba(255, 193, 7, 0.5)',    // yellow 80% opacity
        'rgba(244, 67, 54, 0.5)',
         'rgba(58, 135, 172, 0.5)' 
      ],
      hoverBackgroundColor: [
        'rgba(76, 175, 80, 1)',      // full opacity on hover
        'rgba(255, 193, 7, 1)',
        'rgba(244, 67, 54, 1)',
        'rgba(58, 135, 172, 1)'
      ],
      borderWidth: 1,
      cutout: '70%'
    }]
  };

    const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
      const { width } = chart;
      const { height } = chart;
      const ctx = chart.ctx;
      ctx.restore();
      const fontSize = (height / 100).toFixed(2);
    
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = 'middle';

      const lines = [`${total}`, 'checks'];
    const lineHeight = height/10+5; 
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textHeight = lines.length * lineHeight;
    const textX = width / 2;
    const textY = height / 2 - textHeight / 2 + lineHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * lineHeight);
    });
    ctx.restore();
    }
  };

    
  return (
      <div style={{ maxWidth: '150px', margin: '0 auto' }}>
      <Pie data={chartData} plugins={[centerTextPlugin]} />
    </div>
      );
};


export default SummaryChart;
