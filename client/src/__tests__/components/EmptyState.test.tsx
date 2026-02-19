import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Package } from 'lucide-react'
import { EmptyState, EmptyAssets, EmptySearch, EmptyLogs } from '@/components/ui/EmptyState'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: React.PropsWithChildren) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: React.PropsWithChildren) => <p {...props}>{children}</p>,
  },
}))

describe('EmptyState Component', () => {
  it('should render with required props', () => {
    const { container } = render(<EmptyState icon={Package} title="No Data" />)

    expect(screen.getByText('No Data')).toBeInTheDocument()
    // 验证 SVG 图标存在（lucide 图标渲染为 svg 元素）
    const svgIcon = container.querySelector('svg.lucide-package')
    expect(svgIcon).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(<EmptyState icon={Package} title="No Data" description="This is a description" />)

    expect(screen.getByText('This is a description')).toBeInTheDocument()
  })

  it('should render with action button', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        icon={Package}
        title="No Data"
        action={{ label: 'Add Item', onClick: handleClick }}
      />
    )

    const button = screen.getByRole('button', { name: 'Add Item' })
    expect(button).toBeInTheDocument()
  })

  it('should call action onClick when button is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <EmptyState
        icon={Package}
        title="No Data"
        action={{ label: 'Add Item', onClick: handleClick }}
      />
    )

    const button = screen.getByRole('button', { name: 'Add Item' })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState icon={Package} title="No Data" className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should render different sizes correctly', () => {
    const { container: containerSm } = render(<EmptyState icon={Package} title="No Data" size="sm" />)
    expect(containerSm.firstChild).toHaveClass('py-8')

    const { container: containerMd } = render(<EmptyState icon={Package} title="No Data" size="md" />)
    expect(containerMd.firstChild).toHaveClass('py-12')

    const { container: containerLg } = render(<EmptyState icon={Package} title="No Data" size="lg" />)
    expect(containerLg.firstChild).toHaveClass('py-16')
  })
})

describe('EmptyAssets Preset', () => {
  it('should render with default props', () => {
    render(<EmptyAssets />)

    expect(screen.getByText('暂无资产数据')).toBeInTheDocument()
    expect(
      screen.getByText('开始添加您的第一个资产记录，或从 Excel/数据库导入现有数据')
    ).toBeInTheDocument()
  })

  it('should render with action when onAction is provided', () => {
    const handleClick = vi.fn()
    render(<EmptyAssets onAction={handleClick} />)

    const button = screen.getByRole('button', { name: '添加资产' })
    expect(button).toBeInTheDocument()
  })

  it('should render with custom action label', () => {
    const handleClick = vi.fn()
    render(<EmptyAssets onAction={handleClick} actionLabel="Import" />)

    const button = screen.getByRole('button', { name: 'Import' })
    expect(button).toBeInTheDocument()
  })

  it('should call onAction when button is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<EmptyAssets onAction={handleClick} />)

    const button = screen.getByRole('button', { name: '添加资产' })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('EmptySearch Preset', () => {
  it('should render with search term', () => {
    render(<EmptySearch searchTerm="test" />)

    expect(screen.getByText('未找到匹配结果')).toBeInTheDocument()
    expect(screen.getByText('没有找到与"test"相关的资产')).toBeInTheDocument()
  })

  it('should render without search term', () => {
    render(<EmptySearch />)

    expect(screen.getByText('未找到匹配结果')).toBeInTheDocument()
    expect(screen.getByText('没有找到符合条件的资产')).toBeInTheDocument()
  })
})

describe('EmptyLogs Preset', () => {
  it('should render correctly', () => {
    render(<EmptyLogs />)

    expect(screen.getByText('暂无操作日志')).toBeInTheDocument()
    expect(screen.getByText('系统操作记录将显示在这里')).toBeInTheDocument()
  })
})
