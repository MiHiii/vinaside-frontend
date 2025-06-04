import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import ThemeToggle from '@/components/layouts/common/ThemeToggle';

export default function ThemeTestPage() {
  return (
    <div className='container py-10 space-y-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Theme Test Page</h1>
        <ThemeToggle />
      </div>

      <Separator />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Text elements with different styles</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h1 className='text-4xl font-bold'>Heading 1</h1>
              <h2 className='text-3xl font-bold'>Heading 2</h2>
              <h3 className='text-2xl font-bold'>Heading 3</h3>
              <h4 className='text-xl font-bold'>Heading 4</h4>
              <p className='text-base'>Regular paragraph text</p>
              <p className='text-sm text-muted-foreground'>Small muted text</p>
              <p className='text-xs'>Extra small text</p>
              <a href='#' className='text-primary hover:underline'>
                Link text
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Different button variants</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4'>
            <Button variant='default'>Default</Button>
            <Button variant='destructive'>Destructive</Button>
            <Button variant='outline'>Outline</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='link'>Link</Button>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <Card>
          <CardHeader>
            <CardTitle>Card Examples</CardTitle>
            <CardDescription>Different card styles</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Card>
              <CardHeader className='bg-muted/50'>
                <CardTitle>Nested Card</CardTitle>
                <CardDescription>A card inside another card</CardDescription>
              </CardHeader>
              <CardContent className='pt-4'>
                <p>This is a nested card content</p>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button variant='outline' size='sm'>
                  Cancel
                </Button>
                <Button size='sm'>Save</Button>
              </CardFooter>
            </Card>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' placeholder='Enter your email' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' placeholder='Enter your password' />
            </div>
            <div className='flex items-center space-x-2'>
              <Switch id='airplane-mode' />
              <Label htmlFor='airplane-mode'>Airplane Mode</Label>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Different badge variants</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Badge>Default</Badge>
            <Badge className='bg-secondary text-secondary-foreground'>Secondary</Badge>
            <Badge className='border bg-background hover:bg-secondary'>Outline</Badge>
            <Badge className='bg-destructive text-destructive-foreground'>Destructive</Badge>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className='bg-card p-6 rounded-lg border'>
        <h2 className='text-2xl font-bold text-card-foreground mb-4'>Background Colors</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='p-4 bg-background border rounded-md'>background</div>
          <div className='p-4 bg-foreground text-background border rounded-md'>foreground</div>
          <div className='p-4 bg-primary text-primary-foreground rounded-md'>primary</div>
          <div className='p-4 bg-secondary text-secondary-foreground rounded-md'>secondary</div>
          <div className='p-4 bg-muted text-muted-foreground rounded-md'>muted</div>
          <div className='p-4 bg-accent text-accent-foreground rounded-md'>accent</div>
          <div className='p-4 bg-popover text-popover-foreground border rounded-md'>popover</div>
          <div className='p-4 bg-card text-card-foreground border rounded-md'>card</div>
        </div>
      </div>
    </div>
  );
}
