import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, ShieldCheck, Zap, LayoutDashboard, Calendar, BarChart3,
  GraduationCap, Globe, Moon, Sun, Eye, EyeOff, Users, ClipboardCheck, BookOpen,
  Building2, Award, Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { toast } from 'sonner';

export default function LandingPage() {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showAuth, setShowAuth] = useState(false);

  // Small helper: pick Arabic or English text
  const tr = (ar, en) => (language === 'ar' ? ar : en);

  const features = [
    {
      icon: Building2,
      title: tr('الأقسام والخطة الدراسية', 'Departments & Curriculum'),
      description: tr(
        'هيكل أكاديمي كامل للكلية: الأقسام، والمقررات الرسمية، وخطة دراسية موحدة لكل الطلاب.',
        'A complete academic structure: departments, the official course catalog, and one curriculum for every student.'
      ),
    },
    {
      icon: BookOpen,
      title: tr('تسجيل المواد', 'Course Registration'),
      description: tr(
        'فترات تسجيل محددة، وشعب مطروحة لكل فصل، وتسجيل وانسحاب منظّم دون ازدحام أو أخطاء.',
        'Defined registration windows, per-term offerings, and an orderly flow for registering and withdrawing.'
      ),
    },
    {
      icon: ClipboardCheck,
      title: tr('الامتحانات والدرجات الرسمية', 'Exams & Official Grades'),
      description: tr(
        'مكتب الامتحانات يدير القاعات والجداول ويرصد العلامات الرسمية، والمعدل يُحسب تلقائياً.',
        'The Exams Office manages halls and schedules and enters official marks, with GPA calculated automatically.'
      ),
    },
    {
      icon: Users,
      title: tr('شؤون الطلاب', 'Student Affairs'),
      description: tr(
        'سجلات الطلاب، والحسابات الجامعية، والأنشطة الطلابية في مكان واحد منظّم.',
        'Student records, university accounts, and student activities in one organized place.'
      ),
    },
    {
      icon: GraduationCap,
      title: tr('الهيئة التدريسية', 'Teaching Staff'),
      description: tr(
        'الدكاترة والمعيدون يرفعون المحاضرات ويتابعون علامات مقرراتهم بصلاحيات واضحة.',
        'Instructors and teaching assistants share lectures and follow their course marks with clear permissions.'
      ),
    },
    {
      icon: LayoutDashboard,
      title: tr('لوحات العميد والنواب', 'Dean & Vice-Dean Dashboards'),
      description: tr(
        'رؤية شاملة لسير الكلية أكاديمياً وإدارياً تساعد على المتابعة واتخاذ القرار.',
        'A full view of how the college is running academically and administratively, to support follow-up and decisions.'
      ),
    },
  ];

  const roles = [
    {
      icon: GraduationCap,
      title: tr('الطالب', 'Students'),
      description: tr(
        'مقرراته ودرجاته ومعدله ومخططه الدراسي، مع مساعد ذكي وأدوات دراسة من ملفاته.',
        'Courses, grades, GPA and planner, plus an AI coach and study tools built from their own files.'
      ),
    },
    {
      icon: Users,
      title: tr('الدكاترة والمعيدون', 'Instructors & TAs'),
      description: tr(
        'رفع المحاضرات ومتابعة علامات المقررات التي يدرّسونها.',
        'Share lectures and follow the marks of the courses they teach.'
      ),
    },
    {
      icon: ClipboardCheck,
      title: tr('مكتب الامتحانات', 'Exams Office'),
      description: tr(
        'قاعات الامتحانات، والجداول، ورصد العلامات الرسمية.',
        'Exam halls, schedules, and official mark entry.'
      ),
    },
    {
      icon: Award,
      title: tr('شؤون الطلاب', 'Student Affairs'),
      description: tr(
        'إدارة حسابات الطلاب وسجلاتهم والأنشطة الطلابية.',
        'Manage student accounts, records, and student activities.'
      ),
    },
    {
      icon: BarChart3,
      title: tr('نواب العميد', 'Vice Deans'),
      description: tr(
        'متابعة الشؤون الأكاديمية وشؤون الطلاب كلٌّ ضمن اختصاصه.',
        'Oversee academic and student matters, each within their own scope.'
      ),
    },
    {
      icon: Building2,
      title: tr('العميد', 'Dean'),
      description: tr(
        'صورة كاملة عن الكلية وأقسامها ومؤشراتها.',
        'A complete picture of the college, its departments, and its indicators.'
      ),
    },
  ];

  const reasons = [
    {
      icon: ShieldCheck,
      tone: 'primary',
      title: tr('صلاحيات حسب الدور', 'Role-based access'),
      description: tr(
        'كل مستخدم يرى ويعدّل ما يخص دوره فقط. العلامات الرسمية يرصدها مكتب الامتحانات، لا الطالب.',
        'Everyone sees and edits only what belongs to their role. Official marks are entered by the Exams Office, never by students.'
      ),
    },
    {
      icon: LayoutDashboard,
      tone: 'secondary',
      title: tr('مصدر واحد للحقيقة', 'One source of truth'),
      description: tr(
        'الطلاب والمقررات والدرجات والامتحانات في نظام واحد بدل ملفات وجداول متفرقة.',
        'Students, courses, grades and exams live in one system instead of scattered files and spreadsheets.'
      ),
    },
    {
      icon: Sparkles,
      tone: 'primary',
      title: tr('ذكاء اصطناعي يعرف بيانات الطالب', 'AI that knows the student'),
      description: tr(
        'المساعد الذكي يعتمد على مقررات الطالب ودرجاته ومهامه، فلا يحتاج لنسخ أي شيء.',
        'The AI coach works from the student’s own courses, grades and tasks, with no copy-pasting.'
      ),
    },
    {
      icon: Globe,
      tone: 'secondary',
      title: tr('عربي وإنجليزي بالكامل', 'Fully Arabic & English'),
      description: tr(
        'واجهة ثنائية اللغة مع دعم الاتجاه من اليمين لليسار والوضعين الفاتح والداكن.',
        'A bilingual interface with right-to-left support and light and dark modes.'
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navbar */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 overflow-visible">
          <div className="flex items-center gap-2 min-w-0 overflow-visible">
            <img src="/logo-icon.png" alt="UniPilot" className="h-28 sm:h-32 w-auto object-contain sm:hidden" />
            <img src="/logo-full.png" alt="UniPilot" className="h-28 sm:h-32 w-auto object-contain hidden sm:block" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 btn-3d" onClick={toggleLanguage}>
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 btn-3d" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
            <Button className="rounded-full shadow-lg shadow-primary/20 btn-3d text-sm sm:text-base h-9 sm:h-10 px-4 sm:px-6" onClick={() => setShowAuth(true)}>
              {t('common.login')}
            </Button>
          </div>
        </div>
      </nav>

      {showAuth ? (
        <AuthForm setShowAuth={setShowAuth} />
      ) : (
        <>
          {/* Hero */}
          <section className="py-12 sm:py-20 md:py-24 px-4 sm:px-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
              <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary blur-[100px] sm:blur-[128px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary blur-[100px] sm:blur-[128px] rounded-full" />
            </div>

            <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm border border-primary/20" data-aos="fade-up">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tr('المنصة المتكاملة لإدارة الكلية', 'The all-in-one platform for running your college')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold font-display tracking-tight leading-tight" data-aos="fade-up" data-aos-delay="100">
                {language === 'ar' ? (
                  <>
                    كليتك كاملة <br />
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">في منصة واحدة.</span>
                  </>
                ) : (
                  <>
                    Your Entire College, <br />
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">One Platform.</span>
                  </>
                )}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1" data-aos="fade-up" data-aos-delay="200">
                {tr(
                  'يوني بايلوت يجمع الطلاب وأعضاء هيئة التدريس ومكتب الامتحانات وشؤون الطلاب وإدارة الكلية في نظام واحد: تسجيل المواد، الامتحانات، الدرجات الرسمية، والمتابعة الأكاديمية، مع مساعد ذكي لكل طالب.',
                  'UniPilot brings students, teaching staff, the exams office, student affairs and college leadership into one system: course registration, exams, official grades and academic follow-up, with an AI coach for every student.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2" data-aos="fade-up" data-aos-delay="300">
                <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold gap-2 shadow-xl shadow-primary/25 btn-3d" onClick={() => setShowAuth(true)}>
                  {tr('تسجيل الدخول', 'Sign In')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl-flip" />
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold bg-background btn-3d">
                  <a href="#features">{tr('اكتشف المزايا', 'Explore Features')}</a>
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {tr(
                  'الحسابات تُنشأ من إدارة الكلية، سجّل دخولك برقمك الجامعي.',
                  'Accounts are created by the college administration. Sign in with your university ID.'
                )}
              </p>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 border-t bg-muted/20 scroll-mt-20">
            <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16">
              <div className="text-center space-y-4" data-aos="fade-up">
                <h2 className="text-3xl sm:text-4xl font-bold font-display">
                  {tr('كل ما تحتاجه الكلية', 'Everything a College Needs')}
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                  {tr(
                    'من أول تسجيل للمادة حتى رصد العلامة الرسمية وحساب المعدل، كل خطوة في مكانها.',
                    'From the first course registration to the official mark and GPA, every step has its place.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {features.map((f, i) => (
                  <FeatureCard key={i} index={i} icon={f.icon} title={f.title} description={f.description} />
                ))}
              </div>
            </div>
          </section>

          {/* Roles */}
          <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 border-t">
            <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
              <div className="text-center space-y-4" data-aos="fade-up">
                <h2 className="text-3xl sm:text-4xl font-bold font-display">
                  {tr('لكل دور مساحته', 'A Workspace for Every Role')}
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                  {tr(
                    'كل شخص في الكلية يدخل إلى ما يخصه فقط.',
                    'Everyone in the college sees what is relevant to them, and only that.'
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {roles.map((r, i) => (
                  <RoleCard key={i} index={i} icon={r.icon} title={r.title} description={r.description} />
                ))}
              </div>
            </div>
          </section>

          {/* Student tools highlight */}
          <section className="py-12 sm:py-16 px-4 sm:px-6 border-t bg-muted/20">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-5 sm:p-6 rounded-2xl border bg-background/80" data-aos="fade-up">
                <Calendar className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold mb-1">{tr('مخطط دراسي', 'Study Planner')}</h3>
                <p className="text-sm text-muted-foreground">
                  {tr('مهام ومواعيد الطالب مرتبطة بمقرراته.', 'Tasks and deadlines tied to the student’s own courses.')}
                </p>
              </div>
              <div className="p-5 sm:p-6 rounded-2xl border bg-background/80" data-aos="fade-up" data-aos-delay="80">
                <Zap className="w-6 h-6 text-secondary mb-3" />
                <h3 className="font-bold mb-1">{tr('أدوات دراسة ذكية', 'Smart Study Tools')}</h3>
                <p className="text-sm text-muted-foreground">
                  {tr('ملخصات وبطاقات واختبارات من ملفات الطالب وملاحظاته.', 'Summaries, flashcards and quizzes from the student’s own files and notes.')}
                </p>
              </div>
              <div className="p-5 sm:p-6 rounded-2xl border bg-background/80" data-aos="fade-up" data-aos-delay="160">
                <Bell className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold mb-1">{tr('تنبيهات وتحفيز', 'Notifications & Motivation')}</h3>
                <p className="text-sm text-muted-foreground">
                  {tr('إشعارات بالمستجدات ونظام نقاط يشجع على الاستمرار.', 'Updates as they happen, plus a points system that encourages consistency.')}
                </p>
              </div>
            </div>
          </section>

          {/* Why UniPilot */}
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t bg-card/30">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-6 mb-10" data-aos="fade-up">
                <h2 className="text-2xl sm:text-3xl font-bold font-display">
                  {tr('لماذا يوني بايلوت لكليتك؟', 'Why UniPilot for Your College?')}
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                  {tr(
                    'نظام مصمم حول هيكل الكلية الفعلي، وليس أداة عامة تُكيَّف عليه.',
                    'A system built around how a college actually works, not a generic tool bent to fit.'
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" data-aos="fade-up">
                {reasons.map((r, i) => {
                  const Icon = r.icon;
                  const isPrimary = r.tone === 'primary';
                  return (
                    <div key={i} className="flex gap-4 p-4 sm:p-5 rounded-2xl border bg-background/80">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPrimary ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                        <Icon className={`w-5 h-5 ${isPrimary ? 'text-primary' : 'text-secondary'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">{r.title}</h3>
                        <p className="text-sm text-muted-foreground">{r.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-12 sm:py-16 px-4 sm:px-6 border-t text-center">
            <div className="max-w-2xl mx-auto space-y-5" data-aos="fade-up">
              <h2 className="text-2xl sm:text-3xl font-bold font-display">
                {tr('جاهز للدخول؟', 'Ready to sign in?')}
              </h2>
              <Button size="lg" className="h-12 px-8 rounded-full text-base font-semibold gap-2 shadow-xl shadow-primary/25 btn-3d" onClick={() => setShowAuth(true)}>
                {tr('تسجيل الدخول', 'Sign In')} <ArrowRight className="w-4 h-4 rtl-flip" />
              </Button>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 border-t text-center text-muted-foreground">
            <p>© 2026 UniPilot. {tr('نظام متكامل لإدارة الكلية.', 'An integrated college management system.')}</p>
            <p className="mt-2 text-sm">
              {tr('تطوير: ', 'Developed by ')}
              <span className="font-medium text-foreground">Nibras Daboul</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
              <Link to="/privacy" className="text-primary hover:underline">
                {tr('سياسة الخصوصية', 'Privacy Policy')}
              </Link>
              <span className="text-muted-foreground/70">·</span>
              <Link to="/terms" className="text-primary hover:underline">
                {tr('شروط الخدمة', 'Terms of Service')}
              </Link>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <div
      className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border bg-card hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/5"
      data-aos="fade-up"
      data-aos-delay={index * 80}
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
        <Icon className="w-6 h-6 text-primary group-hover:text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function RoleCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <div
      className="flex gap-4 p-5 rounded-2xl border bg-card hover:border-primary/40 transition-colors"
      data-aos="fade-up"
      data-aos-delay={index * 60}
    >
      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-secondary" />
      </div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function AuthForm({ setShowAuth }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    universityId: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.universityId, formData.password);
      toast.success(language === 'ar' ? 'أهلاً بعودتك' : 'Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        (language === 'ar' ? 'معرّف أو كلمة مرور غير صحيحة' : 'Invalid university ID or password')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
      {/* Transparent background logo - visible behind card */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-70 pointer-events-none"
        style={{ backgroundImage: 'url(/logo-text.png)' }}
      />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <Card className="w-full max-w-md rounded-3xl border shadow-2xl mx-auto bg-white/20 dark:bg-black/20 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <CardHeader className="text-center space-y-2 pb-2">
            <img src="/logo-icon.png" alt="UniPilot" className="w-14 h-14 sm:w-16 sm:h-16 object-contain mx-auto mb-2" />
            <CardTitle className="text-2xl font-display">
              {t('auth.loginTitle')}
            </CardTitle>
            <CardDescription>
              {t('auth.loginSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="universityId">{t('auth.universityId')}</Label>
                <Input
                  id="universityId"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="0260000000"
                  value={formData.universityId}
                  onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                  required
                  className="rounded-xl h-12 font-mono tracking-wide"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="rounded-xl h-12 pe-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 -translate-y-1/2 end-1 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? (language === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (language === 'ar' ? 'إظهار كلمة المرور' : 'Show password')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base" disabled={loading}>
                {loading ? t('common.loading') : t('auth.loginButton')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t('auth.noSelfRegister')}
            </p>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowAuth(false)}
                className="text-muted-foreground text-sm hover:text-foreground"
              >
                {t('common.back')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="mt-auto py-4 text-center text-xs text-muted-foreground relative z-10">
        {language === 'ar' ? 'تطوير: ' : 'Developed by '}
        <span className="font-medium text-foreground">Nibras Daboul</span>
      </p>
    </div>
  );
}
